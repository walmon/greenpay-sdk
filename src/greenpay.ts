/**
 * See .env.default and configure it with the credentials provided by Greenpay support team.
 * Also change the path to your .env file
 */
import * as dotenv from 'dotenv';
dotenv.config();
import * as aesjs from 'aes-js';
import * as jsrsasign from 'jsrsasign';
import { OrderRequestDataModel } from './models/order-request-data.model';
import { CreditCardDetailsModel } from './models/credit-card-details.model';
import { GreenPayResponseModel, SecurityModel, AESPairModel } from '.';
import { GreenPayEncryptedRequestBodyModel } from './models/greenpay-body.model';
import { WebHelper } from './utils/web-helper';
import { RequestTokenizeCardModel } from './models/request-tokenize-card.model';
import { CardTokenizationResponseModel } from './models/card-tokenization-response.model';
const rsa = require('node-jsencrypt');
const rsa_ = new rsa();

const l = (message?: any, ...optionalParams: any[]) => {
  if (process.env.DEBUG) {
    console.log(message, ...optionalParams);
  }
};

export class GreenPaySDK {
  private publicKey: string;

  constructor() {
    this.publicKey = process.env.PUBLIC_KEY;
    if (
      !WebHelper.tokenizeCardEndpoint ||
      !WebHelper.checkoutEndpoint ||
      !this.publicKey
    ) {
      throw new Error('Check your env file. Required parameters missing.');
    }
  }

  /**
   *
   * @param params Tokenization credentials
   * @param cardDetails Details of the card to tokenize
   */
  async tokenizeCard(
    params: RequestTokenizeCardModel,
    cardDetails: CreditCardDetailsModel
  ) {
    l('About to request tokenization of card');
    // Request to tokenize card
    const security = (await WebHelper.requestTokenizeCard(params))
      .body as SecurityModel;

    l(`Card tokenized ${JSON.stringify(security)}`);

    l(`Encrypting tokenization request`);
    rsa_.setPublicKey(process.env.PUBLIC_KEY);
    const body = this.pack(cardDetails, security.session);

    l(`Encrypted package ${JSON.stringify(body)}`);

    l(`Requesting tokenization...`);
    const token = (await WebHelper.tokenizeCard(body, security.token))
      .body as CardTokenizationResponseModel;

    l(`Tokenization successful ${JSON.stringify(token)}`);

    return {
      security,
      token
    };
  }

  async makeTransactionWithCardToken(orderData: OrderRequestDataModel) {
    debugger;
    await WebHelper.makeTransactionWithToken(orderData);
  }

  // async payOrder(cardData: CreditCardDetailsModel, security: SecurityModel) {
  //   try {
  //     debugger;
  //     // Pay order created previously
  //     const payResponse = await this.postPayOrder(cardData, security);

  //     if (
  //       (payResponse.body.status || payResponse.status) !== 200 &&
  //       (payResponse.body.status || payResponse.status) !== 201
  //     ) {
  //       throw new Error(JSON.stringify(payResponse.errors || '[]'));
  //     }

  //     const toVerify = `status:${payResponse.body.status ||
  //       payResponse.status},orderId:${payResponse.body.orderId}`;

  //     l(`toverify ${toVerify}`);
  //     // Verify signature returned in payOrder() response.
  //     const verified = this.verify(payResponse.body._signature, toVerify);
  //     if (!verified) {
  //       throw Error('Response was not received from greenpay!');
  //     }
  //     return payResponse;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // async createOrder(
  //   cardData: CreditCardDetailsModel,
  //   data: OrderRequestDataModel
  // ): Promise<SecurityModel> {
  //   try {
  //     // Create an order in greenpay system.
  //     // Receive an object {session: "xxx",token:"xxx"}
  //     let securityTokenResponse = await this.postOrder(data);

  //     debugger;
  //     if (
  //       (securityTokenResponse.body.status || securityTokenResponse.status) !==
  //         200 &&
  //       (securityTokenResponse.body.status || securityTokenResponse.status) !==
  //         201
  //     ) {
  //       throw new Error(
  //         `${securityTokenResponse.body.status ||
  //           securityTokenResponse.status} ${JSON.stringify(
  //           securityTokenResponse.errors || '[]'
  //         )}`
  //       );
  //     }

  //     const securityToken = securityTokenResponse.body;
  //     l('security: ', JSON.stringify(securityToken));

  //     // tokenize order before created
  //     // const tokenizationOrderResponse = await this.tokenizeOrder(
  //     //   cardData,
  //     //   securityToken
  //     // );

  //     // if (
  //     //   tokenizationOrderResponse.status !== 200 &&
  //     //   tokenizationOrderResponse.status !== 201
  //     // ) {
  //     //   throw new Error(
  //     //     `${tokenizationOrderResponse.status} ${JSON.stringify(
  //     //       tokenizationOrderResponse.errors || '[]'
  //     //     )}`
  //     //   );
  //     // }

  //     // l(
  //     //   'GreenPay tokenize order response: ',
  //     //   JSON.stringify(tokenizationOrderResponse, null, 2)
  //     // );

  //     // const toVerify = `status:${tokenizationOrderResponse.body.status},requestId:${tokenizationOrderResponse.body.requestId}`;

  //     // const verified = this.verify(
  //     //   tokenizationOrderResponse.body._signature,
  //     //   toVerify
  //     // ); // Verify signature returned in payOrder() response.
  //     // if (verified) {
  //     return securityToken;
  //     // } else {
  //     //   throw Error('Response was not received from greenpay!');
  //     // }
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  /**
   * Creates a AES key pairs.
   */
  private generateAESPairs() {
    const key = [];
    let iv;
    for (let k = 0; k < 16; k++) {
      key.push(Math.floor(Math.random() * 255));
    }
    for (let k = 0; k < 16; k++) {
      iv = Math.floor(Math.random() * 255);
    }

    return {
      k: key,
      s: iv
    };
  }

  /**
   * Creates an JSON object with the card data and AES key Pair encrypted.
   * @param obj
   * @param session
   * @param pair_
   */
  private pack(
    obj: CreditCardDetailsModel,
    session: string,
    pair?: AESPairModel
  ) {
    pair = pair || this.generateAESPairs();

    const textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(obj));
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      pair.k,
      new aesjs.Counter(pair.s || 0)
    );
    const encryptedBytes = aesCtr.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    const returnObj = {
      session: session,
      ld: encryptedHex,
      lk: rsa_.encrypt(JSON.stringify(pair))
    };

    l('Pack: ', JSON.stringify(returnObj), '\n');

    return returnObj;
  }

  // private async tokenizeOrder(
  //   cardData: CreditCardDetailsModel,
  //   security: SecurityModel
  // ): Promise<GreenPayResponseModel> {
  //   rsa_.setPublicKey(this.publicKey);
  //   const body = this.pack(cardData, security.session);
  //   const resp = await this.postTokenize(body, security.token);
  //   return resp;
  // }

  private verify(signed: string, toVerify: string) {
    const sig = new jsrsasign.crypto.Signature({
      alg: 'SHA256withRSA'
    });
    // You should verify with your public key in the PEM format
    sig.init(
      `-----BEGIN PUBLIC KEY-----${this.publicKey}-----END PUBLIC KEY-----`
    );
    sig.updateString(toVerify);
    return sig.verify(signed);
  }
}
