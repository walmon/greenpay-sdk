import { CurrencyEnum } from './currency.enum';

export class OrderRequestDataModel {
  secret: string;
  merchantId: string;
  terminal: string;
  amount: number;
  currency: CurrencyEnum;
  description: string;
  orderReference: string;
  billingAddress: {
    // ISO 3166-1 alpha-2
    country: string;
    street1: string;
  };

  /**
   * Security token.
   */
  token: string;

  constructor(params: {
    secret: string;
    merchantId: string;
    amount: number;
    terminal: string,
    currency: CurrencyEnum;
    description: string;
    orderReference: string;
  }) {
    this.secret = params.secret;
    this.merchantId = params.merchantId;
    this.terminal = params.terminal;
    this.amount = params.amount;
    this.currency = params.currency;
    this.description = params.description;
    this.orderReference = params.orderReference;
  }

  /**
   * Add security token
   * @param token Security token for transaction
   */
  authenticateTransaction(token: string) {
    this.token = token;
  }
}
