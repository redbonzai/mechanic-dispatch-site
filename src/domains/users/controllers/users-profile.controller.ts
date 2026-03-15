import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtUserGuard } from '../guards/jwt-user.guard';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Controller('users/me')
@UseGuards(JwtUserGuard)
export class UsersProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getProfile(@Req() req: { user: { id: string } }) {
    return this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        searchCount: true,
        createdAt: true,
        vehicles: true,
      },
    });
  }

  @Patch()
  async updateProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: dto,
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
  }
}
