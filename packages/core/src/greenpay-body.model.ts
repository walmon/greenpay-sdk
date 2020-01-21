export class GreenPayEncryptedRequestBodyModel {
  session: string;
  ld: string;
  lk: any;

  constructor(session: string, ld: string, lk: any){
      this.session = session;
      this.ld = ld;
      this.lk = lk;
  }
}
