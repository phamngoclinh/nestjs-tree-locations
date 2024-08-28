import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPositive, IsString, IsUppercase, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Location } from "../entities/location.entity";

export class CreateLocationDto {
  @IsNotEmpty()
  @MinLength(0)
  @IsString()
  @IsUppercase()
  code: string;

  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(255)
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(10)
  @IsUppercase()
  building: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  area: number;

  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  children: CreateLocationDto[];

  @IsInt()
  @IsOptional()
  parentId: number;

  static toLocationEntity(from: CreateLocationDto): Location {
    const location = new Location();
    location.code = from.code;
    location.name = from.name;
    location.building = from.building;
    location.area = from.area;
    return location;
  }
}
