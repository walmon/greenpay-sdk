export class AESPairModel {
  k: number[];
  s: number | undefined;

  constructor(k: number[], s: number | undefined) {
    this.k = k;
    this.s = s;
  }
}
