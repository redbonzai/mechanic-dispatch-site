import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MechanicAuthService } from './services/mechanic-auth.service';
import { MechanicAuthController } from './controllers/mechanic-auth.controller';
import { JwtMechanicStrategy } from './strategies/jwt-mechanic.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [MechanicAuthController],
  providers: [MechanicAuthService, JwtMechanicStrategy],
  exports: [MechanicAuthService, JwtModule, JwtMechanicStrategy],
})
export class MechanicAuthModule {}
