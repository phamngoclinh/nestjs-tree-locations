import { AuthModule } from '@app/auth/auth.module';
import { LoggerModule } from '@app/logger/logger.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { locationProviders } from './location.providers';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    AuthModule,
    LoggerModule
  ],
  controllers: [LocationsController],
  providers: [LocationsService, ...locationProviders],
})
export class LocationsModule {}
