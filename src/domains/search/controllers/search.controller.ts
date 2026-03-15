import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { SearchService } from '../services/search.service';
import { SearchFixesDto } from '../dto/search-fixes.dto';

class TrackViewDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  clickedLink?: boolean;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('fixes')
  searchFixes(
    @Query() dto: SearchFixesDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.searchService.searchFixes(dto, req.user?.id);
  }

  @Post('mechanics/:id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackMechanicView(
    @Param('id') mechanicId: string,
    @Body() dto: TrackViewDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.searchService.trackMechanicView(mechanicId, {
      userId: req.user?.id,
      sessionId: dto.sessionId,
      source: dto.source,
      clickedLink: dto.clickedLink,
    });
  }
}
