import { Controller, Post, Body, Get, UseGuards, Req, Put, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    try {
      return await this.authService.login(body.username, body.password);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Error desconocido' };
    }
  }

  @Post('verify')
  async verify(@Body() body: { token: string }) {
    try {
      const decoded = this.authService.verifyToken(body.token);
      return { valid: true, data: decoded };
    } catch (error) {
      if (error instanceof Error) {
        return { valid: false, error: error.message };
      }
      return { valid: false, error: 'Error desconocido' };
    }
  }

  @Get('admins')
  async getAllAdmins() {
    return this.authService.getAllAdmins();
  }

  @Post('admins')
  async createAdmin(@Body() body: { username: string; password: string; name: string }) {
    try {
      const result = await this.authService.createAdmin(body.username, body.password, body.name);
      return { id: result.id, username: result.username, name: result.name };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Error desconocido' };
    }
  }

  @Put('admins/:id')
  async updateAdminProfile(
    @Param('id') id: string,
    @Body() body: { name?: string; password?: string },
    @Req() req: any,
  ) {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (!authHeader) return { error: 'No autorizado' };
      const parts = (authHeader as string).split(' ');
      if (parts.length !== 2) return { error: 'No autorizado' };
      const token = parts[1];
      const decoded: any = this.authService.verifyToken(token);
      if (!decoded || decoded.id !== Number(id)) return { error: 'No autorizado' };

      const updated = await this.authService.updateAdminProfile(Number(id), body.name, body.password);
      return updated;
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Error desconocido' };
    }
  }

  @Post('logout')
  async logout() {
    return { message: 'Sesión cerrada' };
  }
}

