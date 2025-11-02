import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './rooms.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Post()
  create(@Body() room: Partial<Room>) {
    return this.roomsService.create(room);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() room: Partial<Room>) {
    return this.roomsService.update(+id, room);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}



