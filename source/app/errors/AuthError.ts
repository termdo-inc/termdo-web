export class AuthError extends Error {
  public constructor() {
    super();
    this.name = "AuthError";
  }

  public static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }
}
