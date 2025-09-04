export class Currency {
  currency: string;
  monthlyFeeGbp: number;

  constructor(currency: string, monthlyFeeGbp: number) {
    this.currency = currency;
    this.monthlyFeeGbp = monthlyFeeGbp;
  }
}