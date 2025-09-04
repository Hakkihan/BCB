import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Account } from './account.entity';
import { CreateAccountDto } from './account.dto';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AccountService {
  private accounts: Map<string, Account> = new Map();

  constructor(private readonly currencyService: CurrencyService) {}

  create(createAccountDto: CreateAccountDto): Account {
    const { accountId, currency, transactionThreshold, discountDays, discountRate } = createAccountDto;
    
    // Validate currency exists
    this.currencyService.findOne(currency);
    
    if (this.accounts.has(accountId)) {
      throw new ConflictException(`Account ${accountId} already exists`);
    }

    const newAccount = new Account(
      accountId,
      currency,
      transactionThreshold,
      discountDays,
      discountRate,
    );
    
    this.accounts.set(accountId, newAccount);
    
    return newAccount;
  }

  findOne(accountId: string): Account {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
    return account;
  }

  findAll(): Account[] {
    return Array.from(this.accounts.values());
  }
}