import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';

@Injectable()
export class MoviesService {
  constructor(@InjectRepository(Movie) private repo: Repository<Movie>) {}

  findAll() {
    return this.repo.find();
  }

  create(movie: Partial<Movie>) {
    const newMovie = this.repo.create(movie);
    return this.repo.save(newMovie);
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, movie: Partial<Movie>) {
    await this.repo.update(id, movie);
    return this.findOne(id); // opcional: devuelve la película actualizada
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}


