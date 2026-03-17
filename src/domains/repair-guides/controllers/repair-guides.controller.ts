import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { RepairGuidesService } from '../services/repair-guides.service';

@Controller('repair-guides')
export class RepairGuidesController {
  constructor(private readonly repairGuidesService: RepairGuidesService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.repairGuidesService.findAll({
      page,
      limit,
      category,
      difficulty,
    });
  }

  @Get('categories')
  getCategories() {
    return this.repairGuidesService.getCategories();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.repairGuidesService.findBySlug(slug);
  }
}
