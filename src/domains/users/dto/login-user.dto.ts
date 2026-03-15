import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72) // matches registration limit; prevents bcrypt DoS
  password: string;
}
