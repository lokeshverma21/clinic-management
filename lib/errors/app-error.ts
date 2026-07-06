// src/lib/errors/app-error.ts

/**
 * Base for every business/domain error. `code` is what the frontend
 * branches on (Part 2: "error codes let the frontend show different UI
 * for different failures"), `statusCode` is the HTTP status the API
 * layer maps it to.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHENTICATED', message, 401);
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 409);
  }
}