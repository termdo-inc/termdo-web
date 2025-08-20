import { ApiService } from "./ApiService";

export class SessionService {
  // Logs out the current browser session by clearing the HttpOnly cookie via gateway
  public static async logout(): Promise<void> {
    try {
      await ApiService.post<unknown>("/auth/logout");
    } catch {
      // Ignore errors: logout should be best-effort
    }
  }
}
