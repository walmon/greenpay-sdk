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
   * Tokenize a card with plain card details (not encrypted).
   * This will request a session to tokenize and then tokenize the plain card details.
   * @param params Tokenization credentials
   * @param cardDetails Details of the card to tokenize (not encrypted).
   */
  async tokenizeCard(
    params: RequestTokenizeCardModel,
    cardDetails: CreditCardDetailsModel
  ) {
    l('About to request tokenization of card');
    const security = await this.requestSessionToTokenizeCard(params);
    l(`Card tokenized ${JSON.stringify(security)}`);

    l(`Encrypting tokenization request`);
    const body = this._pack(cardDetails, security.session);

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

  /**
   * Request to tokenize a card.
   * Use this when you need to request a tokenization independently from the tokenization itself 
   * i.e.: when passing encrypted credit card details
   * @param params Tokenization credentials
   */
  async requestSessionToTokenizeCard(params: RequestTokenizeCardModel) {
    // Request to tokenize card
    const security = (await WebHelper.requestTokenizeCard(params))
      .body as SecurityModel;
      return security;
  }

  /**
   * Tokenize an encrypted card. Call `requestSessionToTokenizeCard` before.
   * @param params Session data from `requestSessionToTokenizeCard`
   * @param encryptedCardDetails Details of the card to tokenize (encrypted)
   */
  async tokenizeCardEncryptedCreditCardData(
    securityToken: SecurityModel,
    encryptedCardDetails: GreenPayEncryptedRequestBodyModel
  ) {
    l(`Requesting tokenization...`);
    const token = (
      await WebHelper.tokenizeCard(encryptedCardDetails, securityToken.token)
    ).body as CardTokenizationResponseModel;

    l(`Tokenization successful ${JSON.stringify(token)}`);

    return {
      securityToken,
      token
    };
  }

  async makeTransactionWithCardToken(orderData: OrderRequestDataModel) {
    debugger;
    await WebHelper.makeTransactionWithToken(orderData);
  }

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
  _pack(
    obj: CreditCardDetailsModel,
    session: string,
    pair?: AESPairModel
  ): GreenPayEncryptedRequestBodyModel {
    rsa_.setPublicKey(this.publicKey);
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
}
