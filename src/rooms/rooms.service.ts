
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './rooms.entity';

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private repo: Repository<Room>) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(room: Partial<Room>) {
    const newRoom = this.repo.create(room);
    return this.repo.save(newRoom);
  }

  async update(id: number, room: Partial<Room>) {
    const existingRoom = await this.repo.findOneBy({ id });
    if (!existingRoom) {
      throw new Error(`Room con ID ${id} no encontrada`);
    }
    Object.assign(existingRoom, room);
    return this.repo.save(existingRoom);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}


