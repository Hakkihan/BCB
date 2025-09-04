import { IsString, IsNumber, IsPositive, IsNotEmpty, Matches, Max } from 'class-validator';

export class CreateCurrencyDto {
  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency is required' })
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter uppercase code (e.g., USD, EUR, GBP)' })
  currency: string;

  @IsNumber({}, { message: 'Monthly fee must be a number' })
  @IsPositive({ message: 'Monthly fee must be a positive number' })
  @Max(10000, { message: 'Monthly fee cannot exceed £10,000' })
  monthlyFeeGbp: number;
}