import { IsString, IsNumber, IsPositive, Min, Max, IsNotEmpty, Matches } from 'class-validator';

export class CreateAccountDto {
  @IsString({ message: 'Account ID must be a string' })
  @IsNotEmpty({ message: 'Account ID is required' })
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Account ID can only contain letters, numbers, hyphens, and underscores' })
  accountId: string;

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency is required' })
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter uppercase code (e.g., USD, EUR, GBP)' })
  currency: string;

  @IsNumber({}, { message: 'Transaction threshold must be a number' })
  @IsPositive({ message: 'Transaction threshold must be a positive number' })
  transactionThreshold: number;

  @IsNumber({}, { message: 'Discount days must be a number' })
  @Min(0, { message: 'Discount days cannot be negative' })
  discountDays: number;

  @IsNumber({}, { message: 'Discount rate must be a number' })
  @Min(0, { message: 'Discount rate cannot be negative' })
  @Max(1, { message: 'Discount rate cannot exceed 100% (1.0)' })
  discountRate: number;
}