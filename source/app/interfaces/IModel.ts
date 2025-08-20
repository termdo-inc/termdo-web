export abstract class IModel {
  public static isValidJson(json: unknown): json is IModel {
    throw new Error("isValidJson must be implemented by subclass");
  }
}
