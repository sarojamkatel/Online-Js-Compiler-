export class BaseError extends Error {
  constructor(message = "") {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
