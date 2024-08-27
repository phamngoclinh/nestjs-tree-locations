import { AuthenticatedUser } from '@app/auth/auth.interface';
import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, TreeRepository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { LocationDuplicatedException } from './location.exception';

@Injectable()
export class LocationsService {
  private queryRunner: QueryRunner;

  constructor(
    private readonly dataSource: DataSource,
    @Inject('LOCATION_REPOSITORY')
    private readonly locationRepository: TreeRepository<Location>,
    private readonly loggerService: LoggerService
  ) {
    this.loggerService.setContext(LocationsService.name);
  }

  private async transaction(command: 'begin' | 'commit' | 'rollback' | 'release'): Promise<void> {
    if (command == 'begin') {
      this.queryRunner = this.dataSource.createQueryRunner();
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();
    } else if (command == 'commit') {
      await this.queryRunner.commitTransaction();
    } else if (command == 'rollback') {
      await this.queryRunner.rollbackTransaction();
    } else if (command == 'release') {
      await this.queryRunner.release();
    }
  }

  private async createSubLocation(parent: Location, children: CreateLocationDto[]) {
    for (let index = 0; index < children.length; index++) {
      const subLocation = CreateLocationDto.toLocationEntity(children[index]);
      subLocation.parent = parent;
      const result = await this.queryRunner.manager.save(subLocation);
      while (children[index]?.children?.length) {
        this.createSubLocation(result, children[index].children);
      }
    }
  }

  async create(createLocationDto: CreateLocationDto, user?: AuthenticatedUser) {
    await this.transaction('begin');
    
    try {
      this.loggerService.log(`Start inserting location: ${JSON.stringify(createLocationDto)}`);

      const location = CreateLocationDto.toLocationEntity(createLocationDto);
      const result = await this.queryRunner.manager.save(location);

      if (createLocationDto?.children?.length) {
        await this.createSubLocation(result, createLocationDto.children);
      }

      this.loggerService.log(`End inserting location: ${JSON.stringify(createLocationDto)}, ${result}`);

      await this.transaction('commit');

      return await this.locationRepository.findDescendantsTree(result);

    } catch (ex) {
      await this.transaction('rollback');
      this.loggerService.error(`Failed inserting location: ${JSON.stringify(createLocationDto)}`, ex)
      if (ex.constraint === 'UQ_CODE') {
        throw new LocationDuplicatedException('Location number is duplicated');
      }
      throw ex;
    } finally {
      await this.transaction('release');
    }
  }

  findAll() {
    return this.locationRepository.find();
  }

  findOne(id: number) {
    this.loggerService.log(`Start getting location id ${id}`);
    const result = this.locationRepository.findOneBy({ id });
    this.loggerService.log(`End getting location id ${id}`);
    return result;
  }

  update(updateLocationDto: UpdateLocationDto) {
    return this.locationRepository.update(updateLocationDto.id, updateLocationDto);
  }

  remove(id: number) {
    return this.locationRepository.delete(id);
  }
}
