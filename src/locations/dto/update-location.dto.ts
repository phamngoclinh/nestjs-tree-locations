import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateLocationDto } from './create-location.dto';

export class UpdateLocationDto extends PartialType(PickType(CreateLocationDto, ['code', 'name', 'building', 'area', 'parentId'])) {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
