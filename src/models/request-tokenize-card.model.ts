export class RequestTokenizeCardModel {
  constructor(
    public secret: string,
    public merchantId: string,
    public requestId: string
  ) {}
}
