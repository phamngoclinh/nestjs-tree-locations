import { PickType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { UpdateLocationDto } from './update-location.dto';

export class RemoveLocationDto extends PickType(UpdateLocationDto, ['id']) {
  @IsBoolean()
  descendant: boolean;
}
