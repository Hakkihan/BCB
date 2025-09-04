import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import * as request from 'supertest';

describe('Billing Integration Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Complete billing workflow', () => {
    it('should handle a complete billing scenario', async () => {
      // 1. Create a currency
      const currencyResponse = await request(app.getHttpServer())
        .post('/currencies')
        .send({
          currency: 'USD',
          monthlyFeeGbp: 25.00,
        })
        .expect(201);

      expect(currencyResponse.body.currency).toBe('USD');
      expect(currencyResponse.body.monthlyFeeGbp).toBe(25);

      // 2. Create an account
      const accountResponse = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          accountId: 'test-account-123',
          currency: 'USD',
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 0.15,
        })
        .expect(201);

      expect(accountResponse.body.accountId).toBe('test-account-123');
      expect(accountResponse.body.currency).toBe('USD');

      // 3. Calculate bill for new account (with discount)
      const newAccountBill = await request(app.getHttpServer())
        .post('/accounts/test-account-123/bill')
        .send({
          billingPeriodStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          billingPeriodEnd: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(), // Next month
          transactionCount: 150,
        })
        .expect(201);

      expect(newAccountBill.body.baseFeeGbp).toBe(25);
      expect(newAccountBill.body.transactionFeeGbp).toBe(5); // 50 transactions over threshold * £0.10
      expect(newAccountBill.body.discountAmountGbp).toBe(4.5); // 15% of (25 + 5)
      expect(newAccountBill.body.totalGbp).toBe(25.5);
      expect(newAccountBill.body.calculations.discountApplied).toBe(true);

      // 4. Calculate bill for old account (no discount)
      const oldAccountBill = await request(app.getHttpServer())
        .post('/accounts/test-account-123/bill')
        .send({
          billingPeriodStart: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days from now
          billingPeriodEnd: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(), // 70 days from now
          transactionCount: 150,
        })
        .expect(201);

      expect(oldAccountBill.body.baseFeeGbp).toBe(25);
      expect(oldAccountBill.body.transactionFeeGbp).toBe(5);
      expect(oldAccountBill.body.discountAmountGbp).toBe(0);
      expect(oldAccountBill.body.totalGbp).toBe(30);
      expect(oldAccountBill.body.calculations.discountApplied).toBe(false);
    });

    it('should handle validation errors correctly', async () => {
      // Test invalid currency creation
      await request(app.getHttpServer())
        .post('/currencies')
        .send({
          currency: 'EUR',
          monthlyFeeGbp: -10, // Invalid negative fee
        })
        .expect(400);

      // Test account creation with non-existent currency
      await request(app.getHttpServer())
        .post('/accounts')
        .send({
          accountId: 'test-account-456',
          currency: 'XYZ', // Valid format but non-existent currency
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 0.15,
        })
        .expect(404);

      // Test billing for non-existent account
      const now = new Date();
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      
      await request(app.getHttpServer())
        .post('/accounts/non-existent/bill')
        .send({
          billingPeriodStart: startDate,
          billingPeriodEnd: endDate,
          transactionCount: 100,
        })
        .expect(404);
    });
  });
});