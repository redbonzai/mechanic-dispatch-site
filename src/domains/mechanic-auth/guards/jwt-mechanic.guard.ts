import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtMechanicGuard extends AuthGuard('jwt-mechanic') {}
