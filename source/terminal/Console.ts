import { Terminal } from "../components/Terminal";
import { Ansi } from "./Ansi";
import { Style } from "./Styles";

export class Console {
  private static promptLines = 1;
  private static cursorLine = this.promptLines;

  public static welcome(t: Terminal): void {
    Console.writeln(
      t,
      `${Style.WELCOME}Welcome to termdo. Type \`help\` for commands.\r\n`,
    );
  }

  public static prompt(t: Terminal) {
    let out = "";

    const downCount = this.promptLines - this.cursorLine;
    if (downCount > 0) {
      out += `\x1b[${downCount}B`;
    }
    if (Console.promptLines > 0) {
      out += "\r";
      for (let i = 0; i < Console.promptLines - 1; i++) {
        out += "\x1b[2K\x1b[F";
      }
      out += "\x1b[2K";
    }

    const promptColorized =
      `${Style.PROMPT_USERNAME}${t.username}` +
      `${Style.PROMPT_HOSTNAME}@${Terminal.HOSTNAME}` +
      `${Style.PROMPT_CWD}:${Terminal.CWD}` +
      `${Style.PROMPT_MARK}${Terminal.MARK} `;
    out += promptColorized;
    out += Console.colorize(t.input);

    const cols = Math.max(1, t.term.cols);
    const totalLength = t.prompt.length + t.input.length;
    Console.promptLines = Math.max(1, Math.ceil(totalLength / cols));
    Console.cursorLine = Console.promptLines;

    const targetCursorPos = t.prompt.length + t.cursorPos;
    const endRow =
      Math.floor(totalLength / cols) - (totalLength % cols === 0 ? 1 : 0);
    const targetRow = Math.floor(targetCursorPos / cols);
    const targetCol = (targetCursorPos % cols) + 1;

    const upCount = endRow - targetRow;
    if (upCount > 0) {
      out += `\x1b[${upCount}A`;
      this.cursorLine -= upCount;
    }
    out += `\x1b[${targetCol}G`;

    Console.write(t, out);
  }

  public static out(t: Terminal, output: string): void {
    Console.promptLines = 1;

    Console.writeln(t, output);
  }

  public static clear(t: Terminal): void {
    Console.write(t, "\x1b[2J\x1b[0f");
  }

  public static moveCursorLeft(t: Terminal): void {
    if (t.cursorPos > 0) {
      t.cursorPos -= 1;
      Console.write(t, "\x1b[D");
    }
  }

  public static moveCursorRight(t: Terminal): void {
    if (t.cursorPos < t.input.length) {
      t.cursorPos += 1;
      Console.write(t, "\x1b[C");
    }
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
      cmd: `${Ansi.BEGIN}${Ansi.FG_BR_BLUE}${Ansi.END}`,
      opt: `${Ansi.BEGIN}${Ansi.FG_BR_GREEN}${Ansi.END}`,
      arg: `${Ansi.BEGIN}${Ansi.FG_BR_CYAN}${Ansi.END}`,
      val: `${Ansi.BEGIN}${Ansi.FG_BR_MAGENTA}${Ansi.END}`,
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

    return out + Ansi.RESET;
  }
}
