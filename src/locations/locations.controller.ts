import { UserDecorator } from '@app/auth/auth.decorator';
import { AuthGuard } from '@app/auth/auth.guard';
import { AuthenticatedUser } from '@app/auth/auth.interface';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { RemoveLocationDto } from './dto/remove-location.dto';
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
  findOne(@Param('id') id: string, @Query('depth') depth: number = 1) {
    return this.locationsService.findOne(+id, +depth);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.update(updateLocationDto);
  }

  @UseGuards(AuthGuard)
  @Delete()
  remove(@Body() removeLocationDto: RemoveLocationDto) {
    return this.locationsService.remove(removeLocationDto);
  }
}
