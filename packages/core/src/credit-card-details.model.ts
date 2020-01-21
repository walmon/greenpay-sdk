export class CreditCardDetailsModel {
  card: CreditCardModel;
  constructor(card: CreditCardModel) {
    this.card = card;
  }
}

export class CreditCardModel {
  cardHolder: string;
  expirationDate: ExpirationDateModel;
  cardNumber: string;
  cvc: string;
  nickname: string;

  constructor(
    cardHolder: string,
    expirationDate: ExpirationDateModel,
    cardNumber: string,
    cvc: string,
    nickname: string
  ) {
    this.cardHolder = cardHolder;
    this.expirationDate = expirationDate;
    this.cardNumber = cardNumber;
    this.cvc = cvc;
    this.nickname = nickname;
  }
}

export class ExpirationDateModel {
  constructor(public month: number, public year: number) {}
}
