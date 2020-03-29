import * as dotenv from 'dotenv';
import {
  GreenPayEncryptedRequestBodyModel,
  GreenPayResponseModel,
  RequestTokenizeCardModel,
  OrderRequestDataModel
} from '@walmon/greenpay-sdk-core';
dotenv.config();
const unirest = require('unirest');

export class WebHelper {
  checkoutEndpoint;
  merchantEndpoint;
  tokenizeCardEndpoint;

  /**
   * Compile from external environment variables
   * @param checkoutEndpoint i.e.: https://sandbox-checkout.greenpay.me
   * @param merchantEndpoint i.e.: https://sandbox-merchant.greenpay.me
   */
  constructor(checkoutEndpoint?: string, merchantEndpoint?: string) {
    this.checkoutEndpoint = checkoutEndpoint || process.env.CHECKOUT_ENDPOINT;
    this.merchantEndpoint = merchantEndpoint || process.env.MERCHANT_ENDPOINT;
    this.tokenizeCardEndpoint = `${this.merchantEndpoint}/tokenize`;
  }

  /**
   * Request a session to tokenize card in the Greenpay gateway.
   * @param data
   * @param accessToken
   */
  requestTokenizeCard(
    data: RequestTokenizeCardModel
  ): Promise<GreenPayResponseModel> {
    const that = this;
    return new Promise(function(resolve, reject) {
      unirest
        .post(that.tokenizeCardEndpoint)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          that.resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }

  tokenizeCard(
    data: GreenPayEncryptedRequestBodyModel,
    accessToken: string
  ): Promise<GreenPayResponseModel> {
    const that = this;
    return new Promise(function(resolve, reject) {
      unirest
        .post(`${that.checkoutEndpoint}/tokenize`)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'liszt-token': accessToken
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          that.resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }

  makeTransactionWithToken(
    data: OrderRequestDataModel
  ): Promise<GreenPayResponseModel> {
    const that = this;
    return new Promise(function(resolve, reject) {
      unirest
        .post(`${that.merchantEndpoint}/tokenPayment`)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          that.resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }

  private resolveGreenPayRequest(
    response: GreenPayResponseModel,
    resolve,
    reject
  ) {
    if ([200, 201].includes(response.body.status || response.status)) {
      resolve(response);
    } else {
      reject(response);
    }
  }
}
