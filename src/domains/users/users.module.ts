import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersAuthService } from './services/users-auth.service';
import { VehiclesService } from './services/vehicles.service';
import { UsersAuthController } from './controllers/users-auth.controller';
import { UsersProfileController } from './controllers/users-profile.controller';
import { VehiclesController } from './controllers/vehicles.controller';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    UsersAuthController,
    UsersProfileController,
    VehiclesController,
  ],
  providers: [UsersAuthService, VehiclesService, JwtUserStrategy],
  exports: [UsersAuthService, JwtModule],
})
export class UsersModule {}
