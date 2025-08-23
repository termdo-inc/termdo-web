export class AccountModel {
  constructor(
    public readonly accountId: number,
    public readonly username: string,
  ) {}

  public static fromData(data: unknown): AccountModel | Error {
    if (!AccountModel.isValidData(data)) {
      return Error();
    }
    return new AccountModel(data.accountId, data.username);
  }

  private static isValidData(data: unknown): data is AccountModel {
    if (typeof data !== "object" || data === null) {
      return false;
    }
    const model = data as AccountModel;
    return (
      typeof model.accountId === "number" && typeof model.username === "string"
    );
  }
}
