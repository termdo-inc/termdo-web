export class StorageService {
  public static saveUsername(username: string): void {
    localStorage.setItem("username", username);
  }

  public static getUsername(): string | null {
    return localStorage.getItem("username");
  }

  public static clearUsername(): void {
    localStorage.removeItem("username");
  }
}
