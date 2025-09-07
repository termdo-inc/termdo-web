export class AppConfig {
  public static readonly ENV =
    import.meta.env.PUBLIC_APP_ENV.length > 0
      ? import.meta.env.PUBLIC_APP_ENV
      : "local";
  public static readonly VER =
    import.meta.env.PUBLIC_APP_VER.length > 0
      ? import.meta.env.PUBLIC_APP_VER
      : "latest";
}
