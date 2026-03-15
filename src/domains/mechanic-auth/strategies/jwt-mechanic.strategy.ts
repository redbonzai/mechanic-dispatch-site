import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

export interface MechanicJwtPayload {
  sub: string;
  email: string;
  type: 'mechanic';
}

@Injectable()
export class JwtMechanicStrategy extends PassportStrategy(
  Strategy,
  'jwt-mechanic',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  async validate(payload: MechanicJwtPayload) {
    if (payload.type !== 'mechanic') {
      throw new UnauthorizedException();
    }
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionTier: true,
      },
    });
    if (!mechanic) {
      throw new UnauthorizedException();
    }
    return mechanic;
  }
}
