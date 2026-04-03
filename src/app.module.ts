import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './domains/database/database.module';
import { MechanicsModule } from './domains/mechanics/mechanics.module';
import { UsersModule } from './domains/users/users.module';
import { MechanicAuthModule } from './domains/mechanic-auth/mechanic-auth.module';
import { RepairGuidesModule } from './domains/repair-guides/repair-guides.module';
import { SearchModule } from './domains/search/search.module';
import { SubscriptionsModule } from './domains/subscriptions/subscriptions.module';
import { CarDataModule } from './domains/car-data/car-data.module';
import { AdminModule } from './domains/admin/admin.module';
import { AnalyticsModule } from './domains/analytics/analytics.module';
import { MailModule } from './domains/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // During Jest on GitHub, NODE_ENV is test and CI is set — skip repo .env so DATABASE_URL stays job-scoped.
      ignoreEnvFile:
        process.env.CI === 'true' && process.env.NODE_ENV === 'test',
    }),
    DatabaseModule,
    MechanicsModule,
    UsersModule,
    MechanicAuthModule,
    RepairGuidesModule,
    SearchModule,
    SubscriptionsModule,
    CarDataModule,
    AdminModule,
    AnalyticsModule,
    MailModule,
  ],
  controllers: [],
})
export class AppModule {}
