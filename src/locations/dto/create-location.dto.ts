import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUppercase, Min, MinLength, ValidateNested } from "class-validator";
import { Location } from "../entities/location.entity";

export class CreateLocationDto {
  @IsNotEmpty()
  @MinLength(0)
  @IsString()
  @IsUppercase()
  code: string;

  @IsNotEmpty()
  @MinLength(0)
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(0)
  @IsUppercase()
  building: string;

  @Min(0)
  area: number;

  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  children: CreateLocationDto[];

  @IsUppercase()
  @IsString()
  @IsOptional()
  parentCode: string;

  static toLocationEntity(from: CreateLocationDto): Location {
    const location = new Location();
    location.code = from.code;
    location.name = from.name;
    location.building = from.building;
    location.area = from.area;
    return location;
  }
}
