export function init() {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString()
  }
}
