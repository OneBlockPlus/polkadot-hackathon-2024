import MESSAGES from "./messsages";

export class APIError extends Error {
  status: number;

  constructor(message = MESSAGES.API_FETCH_ERROR, status = 500) {
    super(message);
    this.status = status;
  }
}
