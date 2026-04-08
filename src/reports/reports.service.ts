import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEntity } from '../functions/functions.entity';
import { Reservation } from '../reservations/reservations.entity';
import { Room } from '../rooms/rooms.entity';
import { Movie } from '../movies/movies.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FunctionEntity) private funcRepo: Repository<FunctionEntity>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
  ) {}

  // Movies stats between date range (inclusive)
  async moviesByRange(from: string, to: string) {
    const funcs = await this.funcRepo.find({ where: { active: true }, relations: ['movie', 'room'] });
    const functionsInRange = funcs.filter(f => typeof f.date === 'string' && f.date >= from && f.date <= to);

    const out: any[] = [];
    const map = new Map<number, { movieTitle: string; totalReservations: number; totalRevenue: number; totalCapacity: number }>();

    for (const fn of functionsInRange) {
      const movie = fn.movie;
      const movieId = movie?.id ?? 0;
      const roomCapacity = Number(fn.room?.capacity ?? 0) || 0;

      const qb = this.reservationRepo.createQueryBuilder('r')
        .select('SUM(r.seats)', 'sum')
        .where('r.functionId = :fid', { fid: fn.id })
        .andWhere('r.active = :active', { active: true });
      const raw = await qb.getRawOne();
      const seats = Number(raw?.sum ?? 0);
      const revenue = seats * (Number(fn.price) || 0);

      const existing = map.get(movieId) ?? { movieTitle: movie?.title ?? 'Sin título', totalReservations: 0, totalRevenue: 0, totalCapacity: 0 };
      existing.totalReservations += seats;
      existing.totalRevenue += revenue;
      existing.totalCapacity += roomCapacity;
      map.set(movieId, existing);
    }

    map.forEach((v, k) => {
      const occupancy = v.totalCapacity > 0 ? Math.round((v.totalReservations / v.totalCapacity) * 100) : 0;
      out.push({ movieId: k, movieTitle: v.movieTitle, totalReservations: v.totalReservations, totalRevenue: v.totalRevenue, occupancyRate: occupancy });
    });

    return out.sort((a, b) => b.totalReservations - a.totalReservations);
  }

  // Rooms occupancy between date range
  async roomsByRange(from: string, to: string) {
    const rooms = await this.roomRepo.find();
    const funcs = await this.funcRepo.find({ where: { active: true }, relations: ['room'] });
    const functionsInRange = funcs.filter(f => typeof f.date === 'string' && f.date >= from && f.date <= to);

    const roomMap = new Map<number, { roomName: string; totalFunctions: number; totalSeatsUsed: number; totalCapacity: number }>();
    for (const f of functionsInRange) {
      const rid = f.room?.id;
      if (!rid) continue;
      const room = f.room ?? rooms.find(r => r.id === rid);
      const capacity = Number(room?.capacity) || 0;
      const entry = roomMap.get(rid) ?? { roomName: room?.name ?? `Sala ${rid}`, totalFunctions: 0, totalSeatsUsed: 0, totalCapacity: 0 };
      entry.totalFunctions += 1;
      entry.totalCapacity += capacity;
      roomMap.set(rid, entry);
    }

    // aggregate reservations per function and then add to room
    for (const f of functionsInRange) {
      const funcId = f.id;
      const rid = f.room?.id;
      if (!rid) continue;
      const qb = this.reservationRepo.createQueryBuilder('r')
        .select('SUM(r.seats)', 'sum')
        .where('r.functionId = :fid', { fid: funcId })
        .andWhere('r.active = :active', { active: true });
      const raw = await qb.getRawOne();
      const seats = Number(raw?.sum ?? 0);
      const entry = roomMap.get(rid);
      if (entry) {
        entry.totalSeatsUsed += seats;
        roomMap.set(rid, entry);
      }
    }

    const out: any[] = [];
    roomMap.forEach((v, k) => {
      const occupancy = v.totalCapacity > 0 ? Math.round((v.totalSeatsUsed / v.totalCapacity) * 100) : 0;
      out.push({ roomId: k, roomName: v.roomName, occupancyPercentage: occupancy, totalFunctions: v.totalFunctions, totalSeatsUsed: v.totalSeatsUsed, totalCapacity: v.totalCapacity });
    });

    return out.sort((a, b) => b.occupancyPercentage - a.occupancyPercentage);
  }
}
