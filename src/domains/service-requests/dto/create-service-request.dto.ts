import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsNotEmpty()
  vehicleMake!: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel!: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  vehicleYear!: number;
}




