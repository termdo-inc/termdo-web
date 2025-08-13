import { Terminal } from "../components/Terminal";
import { Cursor } from "./Cursor";
import { IO } from "./IO";
import { Styles } from "./Styles";

export class Print {
  public static welcome(t: Terminal): void {
    IO.writeln(
      t,
      `${Styles.BEGIN}${Styles.FG_BR_BLUE}${Styles.END}Welcome to termdo. Type \`help\` for commands.\r\n${Styles.RESET}`,
    );
  }

  public static prompt(t: Terminal) {
    IO.write(
      t,
      `\r\x1b[K${Styles.BEGIN}${Styles.FG_YELLOW}${Styles.END}${t.username}${Styles.BEGIN}${Styles.FG_BR_GREEN}${Styles.END}@${Terminal.HOSTNAME}${Styles.BEGIN}${Styles.FG_CYAN}${Styles.END}:${Terminal.CWD}${Styles.BEGIN}${Styles.FG_BLUE}${Styles.END}$ ${t.input}${Styles.RESET}`,
    );
    Cursor.moveRelativeToPrompt(t);
  }
}
