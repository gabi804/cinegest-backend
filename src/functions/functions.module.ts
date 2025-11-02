import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionsService } from './functions.service';
import { FunctionsController } from './functions.controller';
import { FunctionEntity } from './functions.entity';
import { Movie } from '../movies/movies.entity';
import { Room } from '../rooms/rooms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionEntity, Movie, Room])],
  controllers: [FunctionsController],
  providers: [FunctionsService],
})
export class FunctionsModule {}


