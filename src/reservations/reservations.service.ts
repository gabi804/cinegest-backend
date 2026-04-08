import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservations.entity';
import { FunctionEntity } from '../functions/functions.entity';
import { Room } from '../rooms/rooms.entity';

@Injectable()
export class ReservationsService {
  constructor(@InjectRepository(Reservation) private repo: Repository<Reservation>,
    @InjectRepository(FunctionEntity) private funcRepo: Repository<FunctionEntity>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,) {}

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

  
  async create(reservation: Partial<Reservation>) {
    if (!reservation.function && !(reservation as any).userId && !(reservation as any).functionId) throw new BadRequestException('User and Function required');
    if (!reservation.seats || reservation.seats <= 0) throw new BadRequestException('Seats must be > 0');

    const userId = (reservation as any).userId ?? (typeof reservation.user === 'number' ? reservation.user : (reservation.user as any)?.id);
    const funcId = (reservation as any).functionId ?? (typeof reservation.function === 'number' ? reservation.function : (reservation.function as any)?.id);
    
    if (!userId) throw new BadRequestException('User required');
    if (!funcId) throw new BadRequestException('Function required');
    
    const func = await this.funcRepo.findOne({ where: { id: funcId }, relations: ['room', 'movie'] });
    if (!func) throw new BadRequestException('Function not found');

   
    if (!func.active) {
      throw new BadRequestException('No se puede reservar: la función está inactiva');
    }

    const room = func.room;
    if (!room) throw new BadRequestException('Function has no room assigned');

    
    const qb = this.repo.createQueryBuilder('r')
      .select('SUM(r.seats)', 'sum')
      .where('r.functionId = :fid', { fid: funcId })
      .andWhere('r.active = :active', { active: true });
    const raw = await qb.getRawOne();
    const reserved = Number(raw?.sum ?? 0);

    const available = Number(room.capacity) - reserved;
    if (reservation.seats > available) {
      throw new BadRequestException(`No hay suficientes asientos disponibles. Disponibles: ${available}`);
    }

    
    const newReservation = new Reservation();
    newReservation.user = { id: userId } as any;
    newReservation.function = { id: funcId } as any;
    newReservation.seats = reservation.seats;
    newReservation.functionDate = func.date;
    newReservation.functionTime = func.time;
    newReservation.functionPrice = func.price;
    newReservation.active = true;

    const saved = await this.repo.save(newReservation);
    
    // Devolver con relaciones cargadas
    return this.findOne(saved.id);
  }

  async update(id: number, reservation: Partial<Reservation>) {
    const existing = await this.repo.findOne({
      where: { id },
      relations: ['user', 'function', 'function.movie', 'function.room'],
    });

    if (!existing) throw new BadRequestException('Reservation not found');

    // Manejar userId o user directamente
    if ((reservation as any).userId) {
      existing.user = { id: (reservation as any).userId } as any;
    } else if (reservation.user) {
      existing.user = { id: typeof reservation.user === 'number' ? reservation.user : (reservation.user as any)?.id } as any;
    }

    // Manejar functionId o function directamente
    if ((reservation as any).functionId) {
      existing.function = { id: (reservation as any).functionId } as any;
    } else if (reservation.function) {
      existing.function = { id: typeof reservation.function === 'number' ? reservation.function : (reservation.function as any)?.id } as any;
    }

    
    if ((reservation as any).functionId || reservation.function) {
      const newFuncId = (reservation as any).functionId ?? (typeof reservation.function === 'number' ? reservation.function : (reservation.function as any)?.id);
      const newFunc = await this.funcRepo.findOne({ where: { id: newFuncId }, relations: ['room', 'movie'] });
      if (newFunc) {
        existing.functionDate = newFunc.date;
        existing.functionTime = newFunc.time;
        existing.functionPrice = newFunc.price as any;
      }
    }

    // Asiento
    if (reservation.seats !== undefined) {
      existing.seats = reservation.seats;
    }

    await this.repo.save(existing);
    // Devolver con relaciones cargadas
    return this.findOne(id);
  }


  async remove(id: number) {
    // soft delete
    await this.repo.update(id, { active: false } as any);
    // Devolver con relaciones cargadas
    return this.findOne(id);
  }
}


