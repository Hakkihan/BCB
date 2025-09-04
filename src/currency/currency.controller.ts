import { Controller, Post, Body, Get } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './currency.dto';
import { Currency } from './currency.entity';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  create(@Body() createCurrencyDto: CreateCurrencyDto): Currency {
    return this.currencyService.create(createCurrencyDto);
  }

  @Get()
  findAll(): Currency[] {
    return this.currencyService.findAll();
  }
}