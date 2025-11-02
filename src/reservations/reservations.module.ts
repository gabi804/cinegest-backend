import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './reservations.entity';
import { User } from '../users/users.entity';
import { FunctionEntity } from '../functions/functions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User, FunctionEntity])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
