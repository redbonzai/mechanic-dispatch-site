import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateWorkLogDto {
  @IsString()
  @IsNotEmpty()
  mechanicName!: string;

  @IsInt()
  @Min(1)
  hoursWorkedMinutes!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  payoutPercentage!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}




