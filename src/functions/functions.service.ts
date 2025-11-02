import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEntity } from './functions.entity';
import { Movie } from '../movies/movies.entity';
import { Room } from '../rooms/rooms.entity';

@Injectable()
export class FunctionsService {
  constructor(
    @InjectRepository(FunctionEntity)
    private repo: Repository<FunctionEntity>,
    @InjectRepository(Movie)
    private movieRepo: Repository<Movie>,
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
  ) {}

  // Crear una nueva función
  async create(func: any) {
    // Buscar película por id
    const movie = await this.movieRepo.findOne({ where: { id: func.movie } });
    // Buscar sala por id
    const room = await this.roomRepo.findOne({ where: { id: func.room } });

    if (!movie || !room) {
      throw new Error('Movie or Room not found');
    }

    const newFunc = this.repo.create({
      movie,
      room,
      date: func.date,
      time: func.time,
      price: func.price,
      availableSeats: func.availableSeats,
    });

    return this.repo.save(newFunc);
  }

  // Listar todas las funciones
  findAll() {
    return this.repo.find({ relations: ['movie', 'room'] });
  }

  // Obtener una función por id
  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['movie', 'room'] });
  }

  // functions.service.ts
  async update(id: number, func: Partial<FunctionEntity>) {
  // Buscar la función existente
    const existingFunc = await this.repo.findOne({ where: { id }, relations: ['movie', 'room'] });
    if (!existingFunc) throw new Error('Function not found');

  // Actualizar movie si viene
    if (func.movie) {
     const movieId = typeof func.movie === 'number' ? func.movie : func.movie.id;
     const movie = await this.movieRepo.findOne({ where: { id: movieId } });
     if (!movie) throw new Error('Movie not found');
     existingFunc.movie = movie;
    }

  // Actualizar room si viene
    if (func.room) {
     const roomId = typeof func.room === 'number' ? func.room : func.room.id;
     const room = await this.roomRepo.findOne({ where: { id: roomId } });
      if (!room) throw new Error('Room not found');
      existingFunc.room = room;
    }

  // Actualizar los demás campos
    if (func.date) existingFunc.date = func.date;
    if (func.time) existingFunc.time = func.time;
    if (func.price !== undefined) existingFunc.price = func.price;
    if (func.availableSeats !== undefined) existingFunc.availableSeats = func.availableSeats;

  // Guardar los cambios
    return this.repo.save(existingFunc);
  }

  // Eliminar una función por id
  remove(id: number) {
    return this.repo.delete(id);
  }
}



