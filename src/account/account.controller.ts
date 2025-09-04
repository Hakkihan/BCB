import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './account.dto';
import { Account } from './account.entity';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto): Account {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  findAll(): Account[] {
    return this.accountService.findAll();
  }

  @Get(':accountId')
  findOne(@Param('accountId') accountId: string): Account {
    return this.accountService.findOne(accountId);
  }
}