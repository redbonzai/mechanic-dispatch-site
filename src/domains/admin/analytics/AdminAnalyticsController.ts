import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAnalyticsService } from './AdminAnalyticsService';
import { SearchVolumeQueryDto } from './search-volume-query.dto';
import { JwtAuthGuard } from '../auth';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverviewStats();
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.analyticsService.getSubscriptionMetrics();
  }

  @Get('search/top-queries')
  getTopQueries(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getTopSearchQueries(limit);
  }

  @Get('search/volume')
  getSearchVolume(@Query() query: SearchVolumeQueryDto) {
    const days = query.days ?? 30;
    return this.analyticsService.getSearchVolume(days);
  }

  @Get('mechanics')
  getMechanicAnalytics(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.analyticsService.getMechanicAnalytics({ page, limit, sortBy });
  }
}
