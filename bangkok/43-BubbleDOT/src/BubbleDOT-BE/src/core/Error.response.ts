import { StatusCodes, ReasonPhrases } from "http-status-codes";
class ErrorResponse extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
// BadRequestError = 400
class BadRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
// UnauthorizedError = 401
class UnauthorizedError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNAUTHORIZED) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
// ForbiddenError = 403
class ForbiddenError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.FORBIDDEN) {
    super(message, StatusCodes.FORBIDDEN);
  }
}
// NotFoundError = 404
class NotFoundError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.NOT_FOUND) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
// MethodNotAllowedError = 405
class MethodNotAllowedError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.METHOD_NOT_ALLOWED) {
    super(message, StatusCodes.METHOD_NOT_ALLOWED);
  }
}
// NotAcceptableError = 406
class NotAcceptableError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.NOT_ACCEPTABLE) {
    super(message, StatusCodes.NOT_ACCEPTABLE);
  }
}
// ConflictError = 409
class ConflictError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.CONFLICT) {
    super(message, StatusCodes.CONFLICT);
  }
}
// GoneError = 410
class GoneError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.GONE) {
    super(message, StatusCodes.GONE);
  }
}
// UnsupportedMediaTypeError = 415
class UnsupportedMediaTypeError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNSUPPORTED_MEDIA_TYPE) {
    super(message, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  }
}
// TooManyRequestsError = 429
class TooManyRequestsError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.TOO_MANY_REQUESTS) {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}
class UnprocessableEntityError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNPROCESSABLE_ENTITY) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}
export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  MethodNotAllowedError,
  NotAcceptableError,
  ConflictError,
  GoneError,
  UnsupportedMediaTypeError,
  NotFoundError,
  TooManyRequestsError,
  ErrorResponse,
  UnprocessableEntityError
};