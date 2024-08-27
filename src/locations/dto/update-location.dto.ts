import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { IsInt, Min } from 'class-validator';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @Min(0)
  @IsInt()
  id: number;
}
