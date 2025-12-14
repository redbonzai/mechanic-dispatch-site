import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './domains/database/database.module';
import { MechanicsModule } from './domains/mechanics/mechanics.module';
import { ServiceRequestsModule } from './domains/service-requests/service-requests.module';
import { AdminModule } from './domains/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MechanicsModule,
    ServiceRequestsModule,
    AdminModule,
  ],
  controllers: [],
})
export class AppModule {}
