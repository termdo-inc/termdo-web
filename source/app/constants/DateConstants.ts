export class DateConstants {
  public static readonly DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });

  public static readonly DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
  });
}
