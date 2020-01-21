import * as dotenv from 'dotenv';
import { GreenPayEncryptedRequestBodyModel } from '../models/greenpay-body.model';
import { GreenPayResponseModel } from '..';
import { RequestTokenizeCardModel } from '../models/request-tokenize-card.model';
import { OrderRequestDataModel } from '../models/order-request-data.model';
dotenv.config();
const unirest = require('unirest');

export namespace WebHelper {
  export const checkoutEndpoint = process.env.CHECKOUT_ENDPOINT;
  export const merchantEndpoint = process.env.MERCHANT_ENDPOINT;

  export const tokenizeCardEndpoint = `${merchantEndpoint}/tokenize`;

  /**
   * Request a session to tokenize card in the Greenpay gateway.
   * @param data
   * @param accessToken
   */
  export function requestTokenizeCard(
    data: RequestTokenizeCardModel
  ): Promise<GreenPayResponseModel> {
    return new Promise(function(resolve, reject) {
      unirest
        .post(tokenizeCardEndpoint)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }

  export function tokenizeCard(
    data: GreenPayEncryptedRequestBodyModel,
    accessToken: string
  ): Promise<GreenPayResponseModel> {
    return new Promise(function(resolve, reject) {
      unirest
        .post(`${checkoutEndpoint}/tokenize`)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'liszt-token': accessToken
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }

  export function makeTransactionWithToken(
    data: OrderRequestDataModel
  ): Promise<GreenPayResponseModel> {
    return new Promise(function(resolve, reject) {
      unirest
        .post(`${merchantEndpoint}/tokenPayment`)
        .headers({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .send(data)
        .end((response: GreenPayResponseModel) => {
          resolveGreenPayRequest(response, resolve, reject);
        });
    });
  }



  function resolveGreenPayRequest(
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
