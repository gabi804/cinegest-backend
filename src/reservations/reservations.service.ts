import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservations.entity';

@Injectable()
export class ReservationsService {
  constructor(@InjectRepository(Reservation) private repo: Repository<Reservation>) {}

   findAll() {
    return this.repo.find({ 
      relations: ['user', 'function', 'function.movie', 'function.room'] 
    });
  }

   findOne(id: number) {
    return this.repo.findOne({ 
      where: { id }, 
      relations: ['user', 'function', 'function.movie', 'function.room'] 
    });
  }

  create(reservation: Partial<Reservation>) {
    const newReservation = this.repo.create(reservation);
    return this.repo.save(newReservation);
  }

  async update(id: number, reservation: Partial<Reservation>) {
  const existing = await this.repo.findOne({
    where: { id },
    relations: ['user', 'function'],
  });

  if (!existing) throw new Error('Reservation not found');

  // Manejar userId o user directamente
  if ('userId' in reservation) {
    existing.user = { id: reservation.userId } as any;
  } else if (reservation.user) {
    existing.user = { id: typeof reservation.user === 'number' ? reservation.user : reservation.user.id } as any;
  }

  // Manejar functionId o function directamente
  if ('functionId' in reservation) {
    existing.function = { id: reservation.functionId } as any;
  } else if (reservation.function) {
    existing.function = { id: typeof reservation.function === 'number' ? reservation.function : reservation.function.id } as any;
  }

  // Asiento
  if (reservation.seats !== undefined) {
    existing.seats = reservation.seats;
  }

  return this.repo.save(existing);
  }


  remove(id: number) {
    return this.repo.delete(id);
  }
}


