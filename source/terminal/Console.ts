import { Terminal } from "../components/Terminal";
import { Styles } from "./Styles";

export class Console {
  private static prevPromptLines = 0;

  public static welcome(t: Terminal): void {
    Console.writeln(
      t,
      `${Styles.BEGIN}${Styles.FG_BR_BLUE}${Styles.END}Welcome to termdo. Type \`help\` for commands.\r\n${Styles.RESET}`,
    );
  }

  public static prompt(t: Terminal) {
    if (Console.prevPromptLines > 0) {
      Console.write(t, "\r");
      for (let i = 0; i < Console.prevPromptLines - 1; i++) {
        Console.write(t, "\x1b[2K");
        Console.write(t, "\x1b[F");
      }
      Console.write(t, "\x1b[2K");
    }

    Console.write(
      t,
      `${Styles.BEGIN}${Styles.FG_YELLOW}${Styles.END}${t.username}${Styles.BEGIN}${Styles.FG_BR_GREEN}${Styles.END}@${Terminal.HOSTNAME}${Styles.BEGIN}${Styles.FG_CYAN}${Styles.END}:${Terminal.CWD}${Styles.BEGIN}${Styles.FG_BLUE}${Styles.END}$${Styles.RESET} `,
    );

    Console.write(t, Console.colorize(t.input));

    const cols = Math.max(1, t.term.cols || 1);
    Console.prevPromptLines = Math.max(
      1,
      Math.ceil((t.prompt.length + t.input.length) / cols),
    );
  }

  public static out(t: Terminal, output: string): void {
    Console.prevPromptLines = 0;

    Console.writeln(t, output);
  }

  public static clear(t: Terminal): void {
    Console.write(t, "\x1b[2J\x1b[0f");
  }

  // >-----------------------------< Methods  ------------------------------< //

  private static write(t: Terminal, output: string): void {
    t.term.write(output);
  }

  private static writeln(t: Terminal, output: string): void {
    t.term.write(`${output}\r\n`);
  }

  private static colorize(input: string): string {
    const Style = {
      cmd: `${Styles.BEGIN}${Styles.FG_BR_BLUE}${Styles.END}`,
      opt: `${Styles.BEGIN}${Styles.FG_BR_GREEN}${Styles.END}`,
      arg: `${Styles.BEGIN}${Styles.FG_BR_CYAN}${Styles.END}`,
      val: `${Styles.BEGIN}${Styles.FG_BR_MAGENTA}${Styles.END}`,
    };

    let out = Style.cmd;

    enum Mode {
      Command,
      Option,
      Arg,
      Value,
      Idle,
    }

    const set = (next: Mode) => {
      if (mode === next) return;
      mode = next;
      switch (mode) {
        case Mode.Command:
          out += Style.cmd;
          break;
        case Mode.Option:
          out += Style.opt;
          break;
        case Mode.Arg:
          out += Style.arg;
          break;
        case Mode.Value:
          out += Style.val;
          break;
        case Mode.Idle:
          break;
      }
    };

    let mode: Mode = Mode.Command;
    let atTokenStart = true;
    let inSingle = false;
    let inDouble = false;

    for (const ch of input) {
      if (!inSingle && !inDouble && (ch === "'" || ch === '"')) {
        set(Mode.Value);
        if (ch === "'") inSingle = true;
        else inDouble = true;
        out += ch;
        atTokenStart = false;
        continue;
      }
      if (inSingle && ch === "'") {
        inSingle = false;
        out += ch;
        continue;
      }
      if (inDouble && ch === '"') {
        inDouble = false;
        out += ch;
        continue;
      }
      if (inSingle || inDouble) {
        out += ch;
        continue;
      }

      if (ch === " ") {
        out += ch;
        atTokenStart = true;
        set(Mode.Idle);
        continue;
      }

      if (atTokenStart) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (mode !== Mode.Command) {
          set(ch === "-" ? Mode.Option : Mode.Arg);
        }
        atTokenStart = false;
      }

      if (ch === "=") {
        out += ch;
        set(Mode.Value);
        continue;
      }

      out += ch;
    }

    return out + Styles.RESET;
  }
}
