import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { MechanicAuthService } from '../services/mechanic-auth.service';
import { RegisterMechanicDto } from '../dto/register-mechanic.dto';
import { LoginMechanicDto } from '../dto/login-mechanic.dto';
import { UpdateMechanicProfileDto } from '../dto/update-mechanic-profile.dto';
import { JwtMechanicGuard } from '../guards/jwt-mechanic.guard';

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('auth/mechanics')
export class MechanicAuthController {
  constructor(private readonly authService: MechanicAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterMechanicDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginMechanicDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtMechanicGuard)
  logout(@Req() req: { user: { id: string } }) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtMechanicGuard)
  getProfile(@Req() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtMechanicGuard)
  updateProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateMechanicProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
