import { AuthenticatedUser } from '@app/auth/auth.interface';
import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, TreeRepository } from 'typeorm';
import { MAX_LOCATION_DEPTH } from './constants';
import { CreateLocationDto } from './dto/create-location.dto';
import { RemoveLocationDto } from './dto/remove-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { LocationDuplicatedException, LocationInvalidException, LocationNotFoundException } from './location.exception';

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

  /**
   * Initialize database transaction
   * @param command transaction command
   */
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

  /**
   * Create children locations of parent location
   * @param parent parent location
   * @param children children locations
   */
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

  /**
   * Check and assign parent location
   * @param location location
   * @param parentId parentId
   */
  private async checkNAssignParent(location: Location, parentId: number) {
    if (!parentId) {
      throw new LocationInvalidException('parentId must be not empty');
    }

    const parent = await this.queryRunner.manager.findOneBy(Location, { id: parentId });
    if (!parent) {
      throw new LocationNotFoundException('parentId is invalid');
    }

    location.parent = parent;
  }
  

  private async checkNGetLocation(id: number) {
    if (!id) throw new LocationNotFoundException();

    const location = await this.locationRepository.findOneBy({ id });
    if (!location) {
      throw new LocationNotFoundException();
    }

    return location;
  }

  /**
   * Remove children locations of parent location
   * @param parent parent location
   */
  private async removeSubLocation(parent: Location) {
    const [children, count] = await this.queryRunner.manager.findAndCountBy(Location, { parent: parent })
    if (count > 0) {
      for (let index = 0; index < children.length; index++) {
        await this.removeSubLocation(children[index]);
        await this.queryRunner.manager.remove(Location, children[index]);
      }
    }
  }

  async create(createLocationDto: CreateLocationDto, user?: AuthenticatedUser) {
    await this.transaction('begin');
    
    try {
      this.loggerService.log(`Start inserting location: ${JSON.stringify(createLocationDto)}`);

      const location = CreateLocationDto.toLocationEntity(createLocationDto);

      // Check and assign parent location
      if (createLocationDto.parentId) {
        await this.checkNAssignParent(location, createLocationDto.parentId)
      }

      // Save location
      const result = await this.queryRunner.manager.save(location);

      // Check and create children locations
      if (createLocationDto?.children?.length) {
        await this.createSubLocation(result, createLocationDto.children);
      }

      this.loggerService.log(`End inserting location: ${JSON.stringify(createLocationDto)}`);

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
    return this.locationRepository.findTrees();
  }

  async findOne(id: number, depth: number = 1) {
    try {
      if (depth < 1 || depth > MAX_LOCATION_DEPTH) throw new LocationInvalidException();

      this.loggerService.log(`Start getting location id ${id}`);
      const location = await this.checkNGetLocation(id);
      const result = await this.locationRepository.findDescendantsTree(location, { depth });
      this.loggerService.log(`End getting location id ${id}`);

      return result;
    } catch (ex) {
      this.loggerService.error(`Failed getting location id ${id}`, ex);
      throw ex;
    }
  }

  async update(updateLocationDto: UpdateLocationDto) {
    await this.transaction('begin');
    
    try {
      this.loggerService.log(`Start updating location: ${JSON.stringify(updateLocationDto)}`);

      const location = await this.checkNGetLocation(updateLocationDto.id);

      location.code = updateLocationDto.code ?? location.code;
      location.name = updateLocationDto.name ?? location.name;
      location.building = updateLocationDto.building ?? location.building;
      location.area = updateLocationDto.area ?? location.area;

      // Check and assign parent location
      if (updateLocationDto.parentId) {
        await this.checkNAssignParent(location, updateLocationDto.parentId)
      }

      // Save location
      const result = await this.queryRunner.manager.save(location);

      this.loggerService.log(`End updating location: ${JSON.stringify(updateLocationDto)}`);

      await this.transaction('commit');

      return await this.locationRepository.findDescendantsTree(result);
    } catch (ex) {
      await this.transaction('rollback');
      this.loggerService.error(`Failed updating location: ${JSON.stringify(updateLocationDto)}`, ex)
      if (ex.constraint === 'UQ_CODE') {
        throw new LocationDuplicatedException('Location number is duplicated');
      }
      throw ex;
    } finally {
      await this.transaction('release');
    }
  }

  async remove(removeLocationDto: RemoveLocationDto) {
    await this.transaction('begin');

    try {
      this.loggerService.log(`Start deleting location: ${JSON.stringify(removeLocationDto)}`);

      const location = await this.checkNGetLocation(removeLocationDto.id);

      // Remove children locations
      if (removeLocationDto.descendant) {
        await this.removeSubLocation(location);
      }

      await this.queryRunner.manager.remove(Location, location);

      await this.transaction('commit');

      this.loggerService.log(`End deleting location: ${JSON.stringify(removeLocationDto)}`);

      return { deleted: true };
    } catch (ex) {
      this.loggerService.log(`Failed deleting location: ${JSON.stringify(removeLocationDto)}`);
      await this.transaction('rollback');
      throw ex;
    } finally {
      await this.transaction('release');
    }
  }
}
