import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { AccountModule } from '../account/account.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [AccountModule, CurrencyModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}