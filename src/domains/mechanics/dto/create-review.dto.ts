import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsNotEmpty()
  reviewerName!: string;

  @IsString()
  @IsNotEmpty()
  reviewerLocation!: string;

  @IsString()
  @IsNotEmpty()
  reviewText!: string;

  @IsString()
  @IsNotEmpty()
  carModel!: string;

  @IsNumber()
  carYear!: number;

  @IsString()
  @IsNotEmpty()
  serviceDescription!: string;

  @IsString()
  @IsNotEmpty()
  mechanicId!: string;

  @IsString()
  @IsOptional()
  serviceRequestId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];
}





