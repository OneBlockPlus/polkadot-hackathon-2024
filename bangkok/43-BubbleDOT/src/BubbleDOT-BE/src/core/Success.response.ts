import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
interface SuccessResponseOptions {
  message: string;
  statusCode?: number;
  reasonStatusCode?: string;
  metadata: object;
}
interface CreatedResponseOptions extends SuccessResponseOptions {
  options?: object;
}
class SuccessResponse {
  message: string;
  status: number;
  metadata: object;
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }: SuccessResponseOptions) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }
  send(res: Response, _headers: object = {}) {
    return res.status(this.status).json(this);
  }
}
class OkResponse extends SuccessResponse {
  constructor({ message, metadata }: SuccessResponseOptions) {
    super({
      message,
      metadata,
    });
  }
}
class CreatedResponse extends SuccessResponse {
  options?: object;
  constructor({ message, metadata, options = {} }: CreatedResponseOptions) {
    super({
      message,
      statusCode: StatusCodes.CREATED,
      reasonStatusCode: ReasonPhrases.CREATED,
      metadata,
    });
    this.options = options;
  }
}
export { OkResponse, CreatedResponse, SuccessResponse };