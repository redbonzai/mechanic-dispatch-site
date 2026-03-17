import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserJwtPayload } from '../strategies/jwt-user.strategy';
import { MailService } from '../../mail/mail.service';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

@Injectable()
export class UsersAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // Send verification email (non-blocking)
    void this.sendVerificationEmail(user.id, user.email, user.name);

    const tokens = await this.issueTokens(user.id, user.email);
    return { user, ...tokens };
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    name: string,
  ): Promise<void> {
    const token = this.jwtService.sign(
      { sub: userId, purpose: 'verify-email', type: 'user' },
      { expiresIn: '24h' },
    );
    const url = `${APP_URL}/verify-email?token=${token}`;
    await this.mail.sendVerificationEmail(email, name, url);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    let payload: { sub: string; purpose: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired verification link');
    }

    if (payload.purpose !== 'verify-email' || payload.type !== 'user') {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { isEmailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, isEmailVerified: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified)
      throw new BadRequestException('Email already verified');

    void this.sendVerificationEmail(userId, user.email, user.name);
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async refresh(rawRefreshToken: string) {
    // Find by brute-force comparison since we can't reverse hash
    const records = await this.prisma.userRefreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    });

    let match: (typeof records)[0] | undefined;
    for (const record of records) {
      if (await bcrypt.compare(rawRefreshToken, record.token)) {
        match = record;
        break;
      }
    }

    if (!match || !match.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.userRefreshToken.delete({ where: { id: match.id } });
    const tokens = await this.issueTokens(match.user.id, match.user.email);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.userRefreshToken.deleteMany({ where: { userId } });
  }

  private async issueTokens(userId: string, email: string) {
    const payload: UserJwtPayload = { sub: userId, email, type: 'user' };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const rawRefreshToken = this.jwtService.sign(
      { sub: userId, type: 'user-refresh' },
      { expiresIn: '7d' },
    );
    const hashedRefresh = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);

    await this.prisma.userRefreshToken.create({
      data: {
        userId,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
