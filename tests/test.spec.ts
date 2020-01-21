import * as dotenv from 'dotenv';
dotenv.config({
  path: '../.env'
});

import { expect, use } from 'chai';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { GreenPaySDK } from '../packages/backend';
import { FrontendSDK } from '../packages/frontend';

import { fail } from 'assert';
import {
  CurrencyEnum,
  RequestTokenizeCardModel,
  CardTokenizationResponseModel,
  CreditCardDetailsModel,
  CreditCardModel,
  SecurityModel,
  OrderRequestDataModel
} from '../packages/core';

use(chaiAsPromised);

describe('GreenPay Gateway', () => {
  const creditCardData = new CreditCardDetailsModel(
    new CreditCardModel(
      'Jhon Doe',
      {
        month: 9,
        year: 21
      },
      '4532314168813859', // 4485970366452449 DENEGADA,  OK
      '123',
      'visa2449'
    )
  );

  let secret: string;
  let merchantId: string;
  let terminal: string;
  let publicKey: string;

  const requestId = 'xwr-123455';

  let requestTokenization: RequestTokenizeCardModel;
  let cardToken: CardTokenizationResponseModel;

  let requestData: OrderRequestDataModel;
  let sdk: GreenPaySDK;
  let securityToken: SecurityModel;

  before(async () => {
    secret = process.env.SECRET;
    merchantId = process.env.MERCHANT_ID;
    terminal = process.env.TERMINAL_ID;
    publicKey = process.env.PUBLIC_KEY;

    requestTokenization = new RequestTokenizeCardModel(
      secret,
      merchantId,
      requestId
    );

    requestData = new OrderRequestDataModel({
      secret,
      merchantId,
      terminal,
      amount: 10000,
      currency: CurrencyEnum.CRC,
      description: 'Test sale',
      orderReference: '1'
    });
  });

  describe('payments', () => {
    it('should load env vars', async () => {
      expect(secret).to.exist;
      expect(merchantId).to.exist;
      sdk = new GreenPaySDK();
    });

    it('should tokenize the card', async () => {
      try {
        const response = await sdk.tokenizeCard(
          requestTokenization,
          creditCardData
        );

        expect(response).to.exist;
        expect(response.token).to.exist;
        expect(response.token.result.token).to.exist;

        cardToken = response.token;
      } catch (ex) {
        fail(JSON.stringify(ex));
      }
    });

    it('should make a transaction with token', async () => {
      requestData.authenticateTransaction(cardToken.result.token);

      try {
        await sdk.makeTransactionWithCardToken(requestData);
      } catch (ex) {
        fail(JSON.stringify(ex));
      }
    });

    it('should make a payment with details of a credit card encrypted from frontend', async () => {
      try {
        securityToken = await sdk.requestSessionToTokenizeCard(
          requestTokenization
        );

        // Manually handle encrypting the info
        const frontEndSDK = new FrontendSDK(
          publicKey,
          securityToken,
          creditCardData
        );

        const body = frontEndSDK.encrypt();

        const tokenizationResponse = await sdk.tokenizeCardEncryptedCreditCardData(
          securityToken,
          body
        );

        cardToken = tokenizationResponse.token;

        // Add the token to make payment
        requestData.authenticateTransaction(cardToken.result.token);
        await sdk.makeTransactionWithCardToken(requestData);
      } catch (ex) {
        fail(JSON.stringify(ex));
      }
    });
  });
});
