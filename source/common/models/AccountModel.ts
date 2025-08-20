import { IModel } from "../../app/interfaces/IModel";

export class AccountModel extends IModel {
  constructor(
    public readonly accountId: number,
    public readonly username: string,
  ) {
    super();
  }

  public static fromJson(json: unknown): AccountModel {
    if (!this.isValidJson(json)) {
      throw new Error("Invalid JSON for AccountModel");
    }
    return new AccountModel(json.accountId, json.username);
  }

  public static override isValidJson(json: unknown): json is AccountModel {
    if (typeof json !== "object" || json === null) {
      return false;
    }
    const model = json as AccountModel;
    return (
      typeof model.accountId === "number" && typeof model.username === "string"
    );
  }
}
