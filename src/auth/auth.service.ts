import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './auth.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret = 'cinegest-secret-key-2025';

  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {
    this.initializeAdmin();
  }

  private async initializeAdmin() {
    const adminExists = await this.adminRepo.findOne({
      where: { username: 'admin' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.adminRepo.save({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        active: true,
      });
      console.log('✓ Admin default creado: admin / admin123');
    }
  }

  async login(username: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { username } });

    if (!admin) {
      throw new Error('Usuario no encontrado');
    }

    if (!admin.active) {
      throw new Error('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      this.jwtSecret,
      { expiresIn: '24h' },
    );

    return {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      token,
    };
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  async getAllAdmins() {
    return this.adminRepo.find({ select: ['id', 'username', 'name', 'active', 'createdAt'] });
  }

  async createAdmin(username: string, password: string, name: string) {
    const exists = await this.adminRepo.findOne({ where: { username } });
    if (exists) {
      throw new Error('Usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.adminRepo.save({
      username,
      password: hashedPassword,
      name,
      active: true,
    });
  }

  async updateAdmin(id: number, username: string, name: string, active: boolean) {
    await this.adminRepo.update(id, { username, name, active });
    return this.adminRepo.findOne({ where: { id } });
  }

  async updateAdminProfile(id: number, name?: string, password?: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new Error('Admin not found');
    if (name) admin.name = name;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      admin.password = hashed;
    }
    await this.adminRepo.save(admin);
    return { id: admin.id, username: admin.username, name: admin.name };
  }

  async deleteAdmin(id: number) {
    await this.adminRepo.delete(id);
  }
}
