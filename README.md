# Billing Service

A robust billing application built with NestJS and TypeScript that handles multiple billing scenarios including base fees, transaction fees, and promotional discounts.

## Features

- **Currency Management**: Add currencies with monthly base fees in GBP
- **Account Management**: Create customer accounts with configurable billing parameters
- **Bill Calculation**: Calculate monthly bills with detailed breakdowns
- **Promotional Discounts**: Automatic discount application for new accounts
- **Transaction Fees**: Fees applied for transactions exceeding monthly thresholds
- **Comprehensive Validation**: Input validation and error handling
- **Test Coverage**: Complete test suite demonstrating billing accuracy

## API Endpoints

### 1. Create Currency
```
POST /currencies
Content-Type: application/json

{
  "currency": "USD",
  "monthlyFeeGbp": 25.00
}
```

### 2. Create Account
```
POST /accounts
Content-Type: application/json

{
  "accountId": "customer-123",
  "currency": "USD",
  "transactionThreshold": 100,
  "discountDays": 30,
  "discountRate": 0.15
}
```

### 3. Calculate Bill
```
POST /accounts/:accountId/bill
Content-Type: application/json

{
  "billingPeriodStart": "2023-02-01T00:00:00Z",
  "billingPeriodEnd": "2023-02-28T23:59:59Z",
  "transactionCount": 150
}
```

## Architecture Notes

### Controller Separation
The billing and account functionality are intentionally separated into different controllers (`BillingController` and `AccountController`) even though the billing endpoint path (`/accounts/:accountId/bill`) suggests they could be part of the same controller. This separation was designed with future expansion in mind:

- **Account Controller**: Handles account lifecycle management (creation, retrieval, updates)
- **Billing Controller**: Handles billing-specific operations (calculations, billing history, payment processing)

This separation allows for:
- Independent scaling of account vs billing services
- Clear separation of concerns
- Easier addition of future billing features (payment methods, billing history, invoicing)
- Better maintainability as the codebase grows

## Billing Logic

1. **Monthly Base Fee**: Fixed fee in GBP based on account currency
2. **Transaction Fees**: £0.10 per transaction exceeding the account's monthly threshold
3. **Promotional Discounts**: Percentage discount applied for specified days after account creation

## Validation Rules

### Input Validation
- **Currency Codes**: Must be 3-letter uppercase format (e.g., USD, EUR, GBP)
- **Account IDs**: Alphanumeric characters, hyphens, and underscores only
- **Transaction Count**: Must be between 0 and 1,000,000
- **Date Ranges**: Billing periods cannot be more than 1 year in the past or future
- **Discount Rates**: Must be between 0% and 100% (0.0 to 1.0)
- **Monthly Fees**: Must be positive and cannot exceed £10,000

### Business Logic Validation
- **Date Validation**: Billing period start must be before end date
- **Account Existence**: Accounts and currencies must exist before billing
- **Duplicate Prevention**: Account IDs and currency codes must be unique

## Running the Service

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Example Usage

See the integration tests in `src/integration/integration.spec.ts` for complete examples of the billing workflow.