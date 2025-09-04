export class Account {
  accountId: string;
  currency: string;
  transactionThreshold: number;
  discountDays: number;
  discountRate: number;
  createdAt: Date;

  constructor(
    accountId: string,
    currency: string,
    transactionThreshold: number,
    discountDays: number,
    discountRate: number,
  ) {
    this.accountId = accountId;
    this.currency = currency;
    this.transactionThreshold = transactionThreshold;
    this.discountDays = discountDays;
    this.discountRate = discountRate;
    this.createdAt = new Date();
  }
}