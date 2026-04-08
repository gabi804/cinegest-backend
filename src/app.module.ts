import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { FunctionsModule } from './functions/functions.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/users.entity';
import { Movie } from './movies/movies.entity';
import { Room } from './rooms/rooms.entity';
import { FunctionEntity } from './functions/functions.entity';
import { Reservation } from './reservations/reservations.entity';
import { Admin } from './auth/auth.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'elmaslindo',
      database: 'cinegest',
      entities: [User, Movie, Room, FunctionEntity, Reservation, Admin],
      synchronize: true, // solo para desarrollo
    }),
    UsersModule,
    MoviesModule,
    FunctionsModule,
    ReservationsModule,
    RoomsModule,
    ReportsModule,
    AuthModule,
  ],
})
export class AppModule {}

