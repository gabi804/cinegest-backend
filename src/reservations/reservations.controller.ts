import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservations.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(+id);
  }

  @Post()
  create(@Body() reservation: Partial<Reservation>) {
    return this.reservationsService.create(reservation);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() reservation: Partial<Reservation>) {
    return this.reservationsService.update(+id, reservation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(+id);
  }
}


