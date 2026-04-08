import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './reservations.entity';
import { User } from '../users/users.entity';
import { FunctionEntity } from '../functions/functions.entity';
import { Room } from '../rooms/rooms.entity';
import { Movie } from '../movies/movies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User, FunctionEntity, Room, Movie])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
