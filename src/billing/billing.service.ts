import { Injectable, BadRequestException } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { CurrencyService } from '../currency/currency.service';
import { CalculateBillDto, BillBreakdown } from './billing.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly accountService: AccountService,
    private readonly currencyService: CurrencyService,
  ) {}

  calculateBill(accountId: string, calculateBillDto: CalculateBillDto): BillBreakdown {
    const { billingPeriodStart, billingPeriodEnd, transactionCount } = calculateBillDto;
    
    // Validate dates
    const startDate = new Date(billingPeriodStart);
    const endDate = new Date(billingPeriodEnd);
    
    // Check if dates are valid
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid billing period start date format');
    }
    
    if (isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid billing period end date format');
    }
    
    if (startDate >= endDate) {
      throw new BadRequestException('Billing period start must be before end date');
    }

    // Check for reasonable date ranges (not too far in the past or future)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (startDate < oneYearAgo) {
      throw new BadRequestException('Billing period start cannot be more than one year in the past');
    }
    
    if (endDate > oneYearFromNow) {
      throw new BadRequestException('Billing period end cannot be more than one year in the future');
    }

    if (transactionCount < 0) {
      throw new BadRequestException('Transaction count cannot be negative');
    }

    // Check for reasonable transaction count
    if (transactionCount > 1000000) {
      throw new BadRequestException('Transaction count cannot exceed 1,000,000');
    }

    const account = this.accountService.findOne(accountId);
    const currency = this.currencyService.findOne(account.currency);

    // Calculate base fee (monthly base fee in GBP)
    const baseFeeGbp = currency.monthlyFeeGbp;

    // Calculate transaction fees
    const transactionsOverThreshold = Math.max(0, transactionCount - account.transactionThreshold);
    const transactionFeeGbp = transactionsOverThreshold * 0.10; // £0.10 per transaction over threshold

    // Calculate discount if applicable
    const accountAgeInDays = this.calculateDaysBetween(account.createdAt, startDate);
    const isWithinDiscountPeriod = accountAgeInDays <= account.discountDays;
    
    let discountAmountGbp = 0;
    let discountApplied = false;
    let discountReason = 'No discount applicable';

    if (isWithinDiscountPeriod && account.discountRate > 0) {
      const subtotal = baseFeeGbp + transactionFeeGbp;
      discountAmountGbp = subtotal * account.discountRate;
      discountApplied = true;
      discountReason = `${(account.discountRate * 100).toFixed(1)}% promotional discount for new accounts`;
    }

    const totalGbp = baseFeeGbp + transactionFeeGbp - discountAmountGbp;
    const transactionFeeRateGbp = 0.10; // £0.10 per transaction over threshold

    return {
      baseFeeGbp: Number(baseFeeGbp.toFixed(2)),
      transactionFeeGbp: Number(transactionFeeGbp.toFixed(2)),
      discountAmountGbp: Number(discountAmountGbp.toFixed(2)),
      totalGbp: Number(totalGbp.toFixed(2)),
      currency: account.currency,
      accountId,
      billingPeriod: {
        start: billingPeriodStart,
        end: billingPeriodEnd,
      },
      calculations: {
        transactionsOverThreshold,
        discountApplied,
        discountReason,
        transactionFeeRateGbp,
        accountAgeInDays,
      },
    };
  }

  private calculateDaysBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }
}