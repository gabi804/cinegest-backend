import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { FunctionEntity } from './functions.entity';

@Controller('functions')
export class FunctionsController {
  constructor(private functionsService: FunctionsService) {}

  @Get()
  findAll() {
    return this.functionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionsService.findOne(+id);
  }

  @Post()
  create(@Body() func: Partial<FunctionEntity>) {
    return this.functionsService.create(func);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() func: Partial<FunctionEntity>) {
    return this.functionsService.update(+id, func);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.functionsService.remove(+id);
  }
}

