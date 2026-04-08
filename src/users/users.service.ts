import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(q?: string) {
    if (q) {
      // search by name, email or dni
      return this.repo.find({ where: [ { name: ILike(`%${q}%`) }, { email: ILike(`%${q}%`) }, { dni: ILike(`%${q}%`) } ] });
    }
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  create(user: Partial<User>) {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  update(id: number, data: Partial<User>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    // soft-delete
    return this.repo.update(id, { active: false } as any);
  }
}

