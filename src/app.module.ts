import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { FunctionsModule } from './functions/functions.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RoomsModule } from './rooms/rooms.module';
import { User } from './users/users.entity';
import { Movie } from './movies/movies.entity';
import { Room } from './rooms/rooms.entity';
import { FunctionEntity } from './functions/functions.entity';
import { Reservation } from './reservations/reservations.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'elmaslindo',
      database: 'cinegest',
      entities: [User, Movie, Room, FunctionEntity, Reservation],
      synchronize: true, // solo para desarrollo
    }),
    UsersModule,
    MoviesModule,
    FunctionsModule,
    ReservationsModule,
    RoomsModule,
  ],
})
export class AppModule {}

