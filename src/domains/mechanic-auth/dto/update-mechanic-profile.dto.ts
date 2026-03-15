import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMechanicProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  shopName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  serviceRadius?: number;

  @IsOptional()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsString({ each: true })
  skillIds?: string[];
}
