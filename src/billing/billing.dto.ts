import { IsString, IsNumber, IsPositive, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class CalculateBillDto {
  @IsDateString({}, { message: 'Billing period start must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'Billing period start is required' })
  billingPeriodStart: string;

  @IsDateString({}, { message: 'Billing period end must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'Billing period end is required' })
  billingPeriodEnd: string;

  @IsNumber({}, { message: 'Transaction count must be a number' })
  @Min(0, { message: 'Transaction count cannot be negative' })
  transactionCount: number;
}

export class BillBreakdown {
  baseFeeGbp: number;
  transactionFeeGbp: number;
  discountAmountGbp: number;
  totalGbp: number;
  currency: string;
  accountId: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  calculations: {
    transactionsOverThreshold: number;
    discountApplied: boolean;
    discountReason: string;
    transactionFeeRateGbp: number;
    accountAgeInDays: number;
  };
}