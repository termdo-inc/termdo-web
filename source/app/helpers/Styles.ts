import { Ansi } from "./Ansi";

export class Style {
  public static readonly WELCOME = `${Ansi.BEGIN}${Ansi.FG_BR_BLUE}${Ansi.END}`;

  public static readonly PROMPT_USERNAME = `${Ansi.BEGIN}${Ansi.FG_YELLOW}${Ansi.END}`;
  public static readonly PROMPT_HOSTNAME = `${Ansi.BEGIN}${Ansi.FG_BR_GREEN}${Ansi.END}`;
  public static readonly PROMPT_CWD = `${Ansi.BEGIN}${Ansi.FG_CYAN}${Ansi.END}`;
  public static readonly PROMPT_MARK = `${Ansi.BEGIN}${Ansi.FG_BLUE}${Ansi.END}`;

  public static readonly ERROR = `${Ansi.BEGIN}${Ansi.FG_RED}${Ansi.END}`;
}
