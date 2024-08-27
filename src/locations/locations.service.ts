import { Inject, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @Inject('LOCATION_REPOSITORY')
    private readonly locationRepository: Repository<Location>
  ) {}

  create(createLocationDto: CreateLocationDto) {
    return this.locationRepository.insert(createLocationDto);
  }

  findAll() {
    return this.locationRepository.find();
  }

  findOne(id: number) {
    return this.locationRepository.findOneBy({ id });
  }

  update(updateLocationDto: UpdateLocationDto) {
    return this.locationRepository.update(updateLocationDto.id, updateLocationDto);
  }

  remove(id: number) {
    return this.locationRepository.delete(id);
  }
}
