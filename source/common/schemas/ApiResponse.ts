import { ClientError } from "./ClientError";
import { Hostnames } from "./Hostnames";
import { HttpStatus } from "./HttpStatus";
import { ServerError } from "./ServerError";

export class ApiResponse<T> {
  private constructor(
    public readonly hostnames: Hostnames,
    public readonly data: T,
    public readonly httpStatus?: HttpStatus,
    public readonly serverError?: ServerError | null,
    public readonly clientErrors?: ClientError[],
  ) {}

  public static fromJson<T>(
    json: unknown,
    fromData: (data: unknown) => T | Error,
  ): ApiResponse<T> | null {
    if (!ApiResponse.isValidJson(json)) {
      return null;
    }
    const data = fromData(json.data);
    if (data instanceof Error) {
      return null;
    }
    return new ApiResponse(
      json.hostnames,
      data,
      json.httpStatus,
      json.serverError,
      json.clientErrors,
    );
  }

  // >-------------------------< Private Methods >--------------------------< //

  private static isValidJson<T>(json: unknown): json is ApiResponse<T> {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as ApiResponse<T>;
    return (
      Hostnames.isValidJson(model.hostnames) &&
      (model.httpStatus === undefined ||
        HttpStatus.isValidJson(model.httpStatus)) &&
      (model.serverError === undefined ||
        model.serverError === null ||
        ServerError.isValidJson(model.serverError)) &&
      (model.clientErrors === undefined ||
        (Array.isArray(model.clientErrors) &&
          model.clientErrors.every((clientError) =>
            ClientError.isValidJson(clientError),
          )))
    );
  }
}
