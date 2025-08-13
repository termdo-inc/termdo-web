export class Styles {
  // ASCII Fundamental Codes
  public static readonly BEGIN = "\x1b[";
  public static readonly END = "m";
  public static readonly RESET = `${this.BEGIN}0${this.END}`;

  // ASCII Style codes
  public static readonly BOLD = 1;
  public static readonly DIM = 2;
  public static readonly ITALIC = 3;
  public static readonly UNDERLINE = 4;
  public static readonly BLINK = 5;
  public static readonly REVERSE = 7;
  public static readonly HIDDEN = 8;
  public static readonly STRIKE = 9;

  // ASCII Color codes
  public static readonly FG_BLACK = 30;
  public static readonly FG_RED = 31;
  public static readonly FG_GREEN = 32;
  public static readonly FG_YELLOW = 33;
  public static readonly FG_BLUE = 34;
  public static readonly FG_MAGENTA = 35;
  public static readonly FG_CYAN = 36;
  public static readonly FG_WHITE = 37;
  public static readonly FG_DEFAULT = 39;
  public static readonly FG_BR_BLACK = 90;
  public static readonly FG_BR_RED = 91;
  public static readonly FG_BR_GREEN = 92;
  public static readonly FG_BR_YELLOW = 93;
  public static readonly FG_BR_BLUE = 94;
  public static readonly FG_BR_MAGENTA = 95;
  public static readonly FG_BR_CYAN = 96;
  public static readonly FG_BR_WHITE = 97;
  public static readonly BG_BLACK = 40;
  public static readonly BG_RED = 41;
  public static readonly BG_GREEN = 42;
  public static readonly BG_YELLOW = 43;
  public static readonly BG_BLUE = 44;
  public static readonly BG_MAGENTA = 45;
  public static readonly BG_CYAN = 46;
  public static readonly BG_WHITE = 47;
  public static readonly BG_DEFAULT = 49;
  public static readonly BG_BR_BLACK = 100;
  public static readonly BG_BR_RED = 101;
  public static readonly BG_BR_GREEN = 102;
  public static readonly BG_BR_YELLOW = 103;
  public static readonly BG_BR_BLUE = 104;
  public static readonly BG_BR_MAGENTA = 105;
  public static readonly BG_BR_CYAN = 106;
  public static readonly BG_BR_WHITE = 107;
}
