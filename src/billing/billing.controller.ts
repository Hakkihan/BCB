import { Controller, Post, Body, Param } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CalculateBillDto, BillBreakdown } from './billing.dto';

@Controller('accounts')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post(':accountId/bill')
  calculateBill(
    @Param('accountId') accountId: string,
    @Body() calculateBillDto: CalculateBillDto,
  ): BillBreakdown {
    return this.billingService.calculateBill(accountId, calculateBillDto);
  }
}