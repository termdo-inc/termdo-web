export class HttpStatus {
  constructor(
    public readonly code: number,
    public readonly message: string,
  ) {}

  public static isValidJson(json: unknown): json is HttpStatus {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as HttpStatus;
    return typeof model.code === "number" && typeof model.message === "string";
  }
}
