export class ServerError {
  constructor(
    public readonly name: string,
    public readonly message: string,
    public readonly stackTrace: string | null = null,
  ) {}

  public static isValidJson(json: unknown): json is ServerError {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as ServerError;
    return (
      typeof model.name === "string" &&
      typeof model.message === "string" &&
      (model.stackTrace === null || typeof model.stackTrace === "string")
    );
  }
}
