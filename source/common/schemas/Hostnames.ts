export class Hostnames {
  constructor(
    public readonly gatewayApi: string | null,
    public readonly tasksApi: string | null,
    public readonly authApi: string | null,
  ) {}

  public static isValidJson(json: unknown): json is Hostnames {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as Hostnames;
    return (
      (model.gatewayApi === null || typeof model.gatewayApi === "string") &&
      (model.tasksApi === null || typeof model.tasksApi === "string") &&
      (model.authApi === null || typeof model.authApi === "string")
    );
  }
}
