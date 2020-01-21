export class SecurityModel {
  session: string;
  token: string;

  constructor(session: string, token: string) {
    this.session = session;
    this.token = token;
  }
}
