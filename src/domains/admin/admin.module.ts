import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MechanicsModule } from '../mechanics/mechanics.module';
import { DatabaseModule } from '../database/database.module';
import { AdminService } from './services/admin.service';
import {
  AdminMechanicsController,
  AdminReviewsController,
  AdminSkillsController,
} from './controllers';
import { AdminAuthController } from './auth/AdminAuthController';
import { AdminAuthService } from './auth/AdminAuthService';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AdminAnalyticsController } from './analytics/AdminAnalyticsController';
import { AdminAnalyticsService } from './analytics/AdminAnalyticsService';
import { AdminServiceRequestsController } from './service-requests/AdminServiceRequestsController';
import { AdminServiceRequestsService } from './service-requests/AdminServiceRequestsService';

@Module({
  imports: [
    MechanicsModule,
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'default-secret-key-change-in-production',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    AdminMechanicsController,
    AdminReviewsController,
    AdminSkillsController,
    AdminAuthController,
    AdminAnalyticsController,
    AdminServiceRequestsController,
  ],
  providers: [
    AdminService,
    AdminAuthService,
    AdminAnalyticsService,
    AdminServiceRequestsService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AdminService],
})
export class AdminModule {}
