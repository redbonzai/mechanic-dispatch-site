import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class CreateMechanicDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  yearsExperience!: number;

  @IsNumber()
  sinceYear!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  badges?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skillIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}





