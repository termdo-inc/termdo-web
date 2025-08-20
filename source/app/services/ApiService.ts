import { AccountModel } from "../../common/models/AccountModel";

export class ApiService {
  public static async login(
    username: string,
    password: string,
  ): Promise<AccountModel> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    return AccountModel.fromJson(await response.json());
  }
}
