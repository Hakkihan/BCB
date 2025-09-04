import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Currency } from './currency.entity';
import { CreateCurrencyDto } from './currency.dto';

@Injectable()
export class CurrencyService {
  private currencies: Map<string, Currency> = new Map();

  create(createCurrencyDto: CreateCurrencyDto): Currency {
    const { currency, monthlyFeeGbp } = createCurrencyDto;
    
    if (this.currencies.has(currency)) {
      throw new ConflictException(`Currency ${currency} already exists`);
    }

    const newCurrency = new Currency(currency, monthlyFeeGbp);
    this.currencies.set(currency, newCurrency);
    
    return newCurrency;
  }

  findOne(currency: string): Currency {
    const foundCurrency = this.currencies.get(currency);
    if (!foundCurrency) {
      throw new NotFoundException(`Currency ${currency} not found`);
    }
    return foundCurrency;
  }

  findAll(): Currency[] {
    return Array.from(this.currencies.values());
  }
}