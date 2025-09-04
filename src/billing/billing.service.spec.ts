import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { AccountService } from '../account/account.service';
import { CurrencyService } from '../currency/currency.service';
import { BadRequestException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let accountService: AccountService;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: AccountService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CurrencyService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    accountService = module.get<AccountService>(AccountService);
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  describe('calculateBill', () => {
    const now = new Date();
    const mockAccount = {
      accountId: 'test-account',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 0.2,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };

    const mockCurrency = {
      currency: 'USD',
      monthlyFeeGbp: 50,
    };

    beforeEach(() => {
      jest.spyOn(accountService, 'findOne').mockReturnValue(mockAccount);
      jest.spyOn(currencyService, 'findOne').mockReturnValue(mockCurrency);
    });

    it('should calculate bill with base fee only when transactions are below threshold', () => {
      const now = new Date();
      const accountCreated = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const startDate = new Date(accountCreated.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days after account creation (outside discount period)
      const endDate = new Date(accountCreated.getTime() + 36 * 24 * 60 * 60 * 1000).toISOString(); // 36 days after account creation
      
      const calculateBillDto = {
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        transactionCount: 50,
      };

      const result = service.calculateBill('test-account', calculateBillDto);

      expect(result.baseFeeGbp).toBe(50);
      expect(result.transactionFeeGbp).toBe(0);
      expect(result.discountAmountGbp).toBe(0);
      expect(result.totalGbp).toBe(50);
      expect(result.calculations.transactionsOverThreshold).toBe(0);
      expect(result.calculations.discountApplied).toBe(false);
    });

    it('should calculate bill with transaction fees when exceeding threshold', () => {
      const now = new Date();
      const accountCreated = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const startDate = new Date(accountCreated.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days after account creation (outside discount period)
      const endDate = new Date(accountCreated.getTime() + 36 * 24 * 60 * 60 * 1000).toISOString(); // 36 days after account creation
      
      const calculateBillDto = {
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        transactionCount: 150,
      };

      const result = service.calculateBill('test-account', calculateBillDto);

      expect(result.baseFeeGbp).toBe(50);
      expect(result.transactionFeeGbp).toBe(5); // 50 transactions over threshold * £0.10
      expect(result.calculations.transactionsOverThreshold).toBe(50);
    });

    it('should apply promotional discount for new accounts', () => {
      const now = new Date();
      const accountCreated = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const startDate = new Date(accountCreated.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day after account creation
      const endDate = new Date(accountCreated.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days after account creation
      
      const calculateBillDto = {
        billingPeriodStart: startDate, // Within 30 days of account creation
        billingPeriodEnd: endDate,
        transactionCount: 150,
      };

      const result = service.calculateBill('test-account', calculateBillDto);

      expect(result.baseFeeGbp).toBe(50);
      expect(result.transactionFeeGbp).toBe(5);
      expect(result.discountAmountGbp).toBe(11); // 20% of (50 + 5)
      expect(result.totalGbp).toBe(44);
      expect(result.calculations.discountApplied).toBe(true);
    });

    it('should not apply discount for old accounts', () => {
      const now = new Date();
      const accountCreated = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const startDate = new Date(accountCreated.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days after account creation
      const endDate = new Date(accountCreated.getTime() + 36 * 24 * 60 * 60 * 1000).toISOString(); // 36 days after account creation
      
      const calculateBillDto = {
        billingPeriodStart: startDate, // More than 30 days after account creation
        billingPeriodEnd: endDate,
        transactionCount: 150,
      };

      const result = service.calculateBill('test-account', calculateBillDto);

      expect(result.discountAmountGbp).toBe(0);
      expect(result.calculations.discountApplied).toBe(false);
    });

    it('should throw error for invalid date range', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days from now
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days from now (before start)
      
      const calculateBillDto = {
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate, // End before start
        transactionCount: 100,
      };

      expect(() => {
        service.calculateBill('test-account', calculateBillDto);
      }).toThrow(BadRequestException);
    });

    it('should throw error for negative transaction count', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      
      const calculateBillDto = {
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        transactionCount: -10,
      };

      expect(() => {
        service.calculateBill('test-account', calculateBillDto);
      }).toThrow(BadRequestException);
    });
  });
});