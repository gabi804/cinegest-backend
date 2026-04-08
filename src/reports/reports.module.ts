import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FunctionEntity } from '../functions/functions.entity';
import { Reservation } from '../reservations/reservations.entity';
import { Room } from '../rooms/rooms.entity';
import { Movie } from '../movies/movies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionEntity, Reservation, Room, Movie])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
