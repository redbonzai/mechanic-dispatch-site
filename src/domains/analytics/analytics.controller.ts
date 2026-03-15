import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { AnalyticsService } from './analytics.service';

class FireEventDto {
  @IsString()
  event: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  clientId?: string;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Public endpoint that proxies frontend events to GA4 Measurement Protocol.
   * Called by the frontend AnalyticsService to fire server-side events.
   * Never returns an error to the caller — analytics must never break the app.
   */
  @Post('events')
  @HttpCode(HttpStatus.NO_CONTENT)
  async fireEvent(@Body() dto: FireEventDto): Promise<void> {
    try {
      await this.analyticsService.fireEvent({
        event: dto.event,
        params: dto.params,
        clientId: dto.clientId,
      });
    } catch {
      // Swallow silently
    }
  }
}
