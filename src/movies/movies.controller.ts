import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movies.entity';

@Controller('movie')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Post()
  create(@Body() movie: Partial<Movie>) {
    return this.moviesService.create(movie);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() movie: Partial<Movie>) {
    return this.moviesService.update(+id, movie);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}



