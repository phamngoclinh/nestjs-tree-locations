import { UserDecorator } from '@app/auth/auth.decorator';
import { AuthGuard } from '@app/auth/auth.guard';
import { AuthenticatedUser } from '@app/auth/auth.interface';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createLocationDto: CreateLocationDto, @UserDecorator() user: AuthenticatedUser) {
    return this.locationsService.create(createLocationDto, user);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    updateLocationDto.id = +id;
    return this.locationsService.update(updateLocationDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
