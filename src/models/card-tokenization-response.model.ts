export class CardTokenizationResponseModel {
  status: number;
  requestId: string;
  /** Save this on your DB. */
  result: {
    token: string;
    last_digits: string;
    bin: string;
  };
  expiration_date: string;
  brand: string;
  nickname: string;
  errors: [];
  /** Url */
  callback: string;
  _signature: string;
}
