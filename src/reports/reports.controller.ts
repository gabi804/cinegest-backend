import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('movies')
  async movies(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) return [];
    return this.reportsService.moviesByRange(from, to);
  }

  @Get('rooms')
  async rooms(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) return [];
    return this.reportsService.roomsByRange(from, to);
  }
}
