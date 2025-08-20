import type { IModel } from "../../app/interfaces/IModel";
import { ClientError } from "./ClientError";
import { Hostnames } from "./Hostnames";
import { HttpStatus } from "./HttpStatus";
import { ServerError } from "./ServerError";

export class ApiResponse<T extends IModel> {
  private constructor(
    public readonly hostnames: Hostnames,
    public readonly httpStatus: HttpStatus,
    public readonly serverError: ServerError | null,
    public readonly clientErrors: ClientError[],
    public readonly data: T,
  ) {}

  public static isValidJson<T extends IModel>(
    json: unknown,
    dataValidator: (json: unknown) => json is T,
  ): json is ApiResponse<T> {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as ApiResponse<T>;
    return (
      Hostnames.isValidJson(model.hostnames) &&
      HttpStatus.isValidJson(model.httpStatus) &&
      (model.serverError === null ||
        ServerError.isValidJson(model.serverError)) &&
      Array.isArray(model.clientErrors) &&
      model.clientErrors.every((clientError) =>
        ClientError.isValidJson(clientError),
      ) &&
      dataValidator(model.data)
    );
  }
}
