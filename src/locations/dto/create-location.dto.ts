export class CreateLocationDto {
  code: string;
  name: string;
  building: string;
  area: number;
  children?: CreateLocationDto[];
  parent?: CreateLocationDto;
}
