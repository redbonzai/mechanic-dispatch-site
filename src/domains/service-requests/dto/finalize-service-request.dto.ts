import { IsInt, Min } from 'class-validator';

export class FinalizeServiceRequestDto {
  @IsInt()
  @Min(0)
  finalAmountCents!: number;
}
