import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { AccountModule } from './account/account.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [CurrencyModule, AccountModule, BillingModule],
})
export class AppModule {}