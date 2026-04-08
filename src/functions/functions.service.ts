import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEntity } from './functions.entity';
import { Movie } from '../movies/movies.entity';
import { Room } from '../rooms/rooms.entity';
import { Reservation } from '../reservations/reservations.entity';

@Injectable()
export class FunctionsService implements OnModuleInit {
  constructor(
    @InjectRepository(FunctionEntity)
    private repo: Repository<FunctionEntity>,
    @InjectRepository(Movie)
    private movieRepo: Repository<Movie>,
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
  ) {}

  // Crea una nueva función
  async create(func: any) {
    // Busca película por id
    const movie = await this.movieRepo.findOne({ where: { id: func.movie } });
    // Busca sala por id
    const room = await this.roomRepo.findOne({ where: { id: func.room } });

    if (!movie || !room) {
      throw new Error('Movie or Room not found');
    }

    // Only allow creating functions for active movies
    if (!movie.active) {
      throw new Error('No se puede crear función: la película está inactiva');
    }

    const newFunc = this.repo.create({
      movie,
      room,
      date: func.date,
      time: func.time,
      price: func.price,
    });

    return this.repo.save(newFunc);
  }

  // Listar todas las funciones (activas e inactivas)
  findAll() {
    return this.repo.find({ relations: ['movie', 'room'] });
  }

  async getAvailability(id: number) {
    const func = await this.repo.findOne({ where: { id }, relations: ['room'] });
    if (!func) throw new Error('Function not found');
    const room = func.room;
    const qb = this.reservationRepo.createQueryBuilder('r')
      .select('SUM(r.seats)', 'sum')
      .where('r.functionId = :fid', { fid: id })
      .andWhere('r.active = :active', { active: true });
    const raw = await qb.getRawOne();
    const reserved = Number(raw?.sum ?? 0);
    const available = Number(room.capacity) - reserved;
    return { available };
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
    // capacity is derived from the linked room's capacity

  // Guardar los cambios
    return this.repo.save(existingFunc);
  }

  // Eliminar una función por id
  async remove(id: number) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error('Function not found');
    existing.active = false;
    return this.repo.save(existing);
  }

  onModuleInit() {
    return this.deactivatePastFunctions();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'deactivatePastFunctions' })
  async deactivatePastFunctions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDateString = today.toISOString().slice(0, 10);

    const pastFunctions = await this.repo.find({ where: { active: true } });
    const outdated = pastFunctions.filter((func) => {
      if (!func.date) return false;
      return func.date < todayDateString;
    });

    if (!outdated.length) return;
    await this.repo.save(
      outdated.map((func) => ({
        ...func,
        active: false,
      })),
    );
  }
}



