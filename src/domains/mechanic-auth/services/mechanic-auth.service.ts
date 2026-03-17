import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterMechanicDto } from '../dto/register-mechanic.dto';
import { LoginMechanicDto } from '../dto/login-mechanic.dto';
import { UpdateMechanicProfileDto } from '../dto/update-mechanic-profile.dto';
import { MechanicJwtPayload } from '../strategies/jwt-mechanic.strategy';
import { MailService } from '../../mail/mail.service';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(
  prisma: PrismaService,
  base: string,
): Promise<string> {
  let slug = slugify(base);
  let counter = 0;
  while (await prisma.mechanic.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${slugify(base)}-${counter}`;
  }
  return slug;
}

@Injectable()
export class MechanicAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterMechanicDto) {
    const existing = await this.prisma.mechanic.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const slug = await uniqueSlug(this.prisma, dto.name);
    const currentYear = new Date().getFullYear();

    const mechanic = await this.prisma.mechanic.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        slug,
        location: dto.location,
        shopName: dto.shopName,
        phone: dto.phone,
        website: dto.website,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        sinceYear: currentYear - dto.yearsExperience,
        certifications: dto.certifications ?? [],
        isActive: false,
        ...(dto.skillIds?.length
          ? {
              skills: {
                create: dto.skillIds.map((skillId) => ({ skillId })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
      },
    });

    // Send verification email (non-blocking)
    void this.sendVerificationEmail(
      mechanic.id,
      mechanic.email!,
      mechanic.name,
    );

    const tokens = await this.issueTokens(mechanic.id, mechanic.email!);
    return { mechanic, ...tokens };
  }

  async sendVerificationEmail(
    mechanicId: string,
    email: string,
    name: string,
  ): Promise<void> {
    const token = this.jwtService.sign(
      { sub: mechanicId, purpose: 'verify-email', type: 'mechanic' },
      { expiresIn: '24h' },
    );
    const url = `${APP_URL}/mechanic/verify-email?token=${token}`;
    await this.mail.sendMechanicWelcomeEmail(email, name, url);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    let payload: { sub: string; purpose: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired verification link');
    }

    if (payload.purpose !== 'verify-email' || payload.type !== 'mechanic') {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.mechanic.update({
      where: { id: payload.sub },
      data: { isEmailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginMechanicDto) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!mechanic || !mechanic.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, mechanic.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(mechanic.id, mechanic.email!);
    return {
      mechanic: {
        id: mechanic.id,
        email: mechanic.email,
        name: mechanic.name,
        slug: mechanic.slug,
        subscriptionStatus: mechanic.subscriptionStatus,
        subscriptionTier: mechanic.subscriptionTier,
        isActive: mechanic.isActive,
      },
      ...tokens,
    };
  }

  async refresh(rawRefreshToken: string) {
    const records = await this.prisma.mechanicRefreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: {
        mechanic: {
          select: { id: true, email: true },
        },
      },
    });

    let match: (typeof records)[0] | undefined;
    for (const record of records) {
      if (await bcrypt.compare(rawRefreshToken, record.token)) {
        match = record;
        break;
      }
    }

    if (!match) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.mechanicRefreshToken.delete({ where: { id: match.id } });
    return this.issueTokens(match.mechanic.id, match.mechanic.email!);
  }

  async logout(mechanicId: string) {
    await this.prisma.mechanicRefreshToken.deleteMany({
      where: { mechanicId },
    });
  }

  async getProfile(mechanicId: string) {
    return this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        bio: true,
        shopName: true,
        phone: true,
        website: true,
        location: true,
        imageUrl: true,
        yearsExperience: true,
        certifications: true,
        rating: true,
        reviewCount: true,
        profileViews: true,
        searchAppearances: true,
        linkClicks: true,
        isActive: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        trialEndsAt: true,
        subscriptionEndAt: true,
        skills: { include: { skill: true } },
      },
    });
  }

  async updateProfile(mechanicId: string, dto: UpdateMechanicProfileDto) {
    const { skillIds, ...profileData } = dto;

    if (skillIds !== undefined) {
      await this.prisma.mechanicSkill.deleteMany({ where: { mechanicId } });
      if (skillIds.length > 0) {
        await this.prisma.mechanicSkill.createMany({
          data: skillIds.map((skillId) => ({ mechanicId, skillId })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: profileData,
      select: {
        id: true,
        name: true,
        bio: true,
        shopName: true,
        phone: true,
        website: true,
        location: true,
        yearsExperience: true,
        certifications: true,
        skills: { include: { skill: true } },
      },
    });
  }

  private async issueTokens(mechanicId: string, email: string) {
    const payload: MechanicJwtPayload = {
      sub: mechanicId,
      email,
      type: 'mechanic',
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const rawRefreshToken = this.jwtService.sign(
      { sub: mechanicId, type: 'mechanic-refresh' },
      { expiresIn: '7d' },
    );
    const hashedRefresh = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);

    await this.prisma.mechanicRefreshToken.create({
      data: {
        mechanicId,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
