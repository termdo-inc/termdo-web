export class Hostnames {
  constructor(
    public readonly gatewayApi?: string,
    public readonly authApi?: string,
    public readonly tasksApi?: string,
  ) {}

  public static isValidJson(json: unknown): json is Hostnames {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as Hostnames;
    return (
      (model.gatewayApi === undefined ||
        typeof model.gatewayApi === "string") &&
      (model.authApi === undefined || typeof model.authApi === "string") &&
      (model.tasksApi === undefined || typeof model.tasksApi === "string")
    );
  }
}
