export class AppConfig {
  public static readonly ENV = process.env["APP_ENV"] ?? "local";
  public static readonly VER = process.env["APP_VER"] ?? "latest";
}
