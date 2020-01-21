import * as JsEncryptModule from 'jsencrypt';
import * as aesjs from 'aes-js';
import { SecurityModel, CreditCardDetailsModel } from '@walmon/greenpay-sdk-core';

/**
 * Front end library to encrypt credit card details.
 */
export class FrontendSDK {
  rsa_ = new JsEncryptModule.JSEncrypt();

  /**
   * Encrypt the credit card details before requesting details tokenization.
   * @param publicKey Public key to encrypt
   */
  constructor(
    private publicKey: string,
    private tokenizationSession: SecurityModel,
    private cardDetails: CreditCardDetailsModel
  ) {
    /**
     * Carga la llave publica enviada por GreenPay en el archivo de credenciales
     * Se deben elimnar los saltos de lines y los dashes -----BEGIN PUBLIC KEY----- y -----END PUBLIC KEY-----
     * TODO : reemplazar valores
     */
    this.rsa_.setPublicKey(publicKey);
  }

  /**
   * Returns the encrypted details.
   */
  encrypt() {
    return this.pack(this.cardDetails, this.tokenizationSession.session);
  }

  /**
   * Genera el par de llaves AES utilizados para cifrar el JSON con los datos de la tarjeta
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

  /** Creates an JSON object with the card data and AES key Pair encrypted */
  private pack(obj, session, pair_?) {
    const pair = pair_ !== undefined ? pair_ : this.generateAESPairs();

    const textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(obj));
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      pair.k,
      new aesjs.Counter(pair.s)
    );
    const encryptedBytes = aesCtr.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    const returnObj = {
      session: session,
      ld: encryptedHex,
      lk: this.rsa_.encrypt(JSON.stringify(pair))
    };
    return returnObj;
  }
}
