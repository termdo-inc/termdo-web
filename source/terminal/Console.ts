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

  public static enter(t: Terminal): void {
    const downCount = Console.promptLines - Console.cursorLine;
    if (downCount > 0) {
      Console.write(t, `\x1b[${downCount}B`);
    }
    Console.writeln(t, "");
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
      const realCursorPos = t.cursorPos + t.prompt.length;
      if (realCursorPos % t.term.cols === 0) {
        Console.write(t, `\x1b[1A\x1b[${t.term.cols}C`);
        Console.cursorLine -= 1;
      } else {
        Console.write(t, "\x1b[D");
      }
      t.cursorPos -= 1;
    }
  }

  public static moveCursorRight(t: Terminal): void {
    if (t.cursorPos < t.input.length) {
      const realCursorPos = t.cursorPos + t.prompt.length;
      if ((realCursorPos + 1) % t.term.cols === 0) {
        Console.write(t, `\x1b[1B\x1b[${t.term.cols}D`);
        Console.cursorLine += 1;
      } else {
        Console.write(t, "\x1b[C");
      }
      t.cursorPos += 1;
    }
  }

  public static moveCursorHome(t: Terminal): void {
    t.cursorPos = 0;
    if (this.cursorLine > 1) {
      Console.write(t, `\x1b[${this.cursorLine - 1}A`);
      Console.cursorLine = 1;
    }
    Console.write(t, `\x1b[${t.prompt.length + 1}G`);
  }

  public static moveCursorEnd(t: Terminal): void {
    t.cursorPos = t.input.length;
    if (this.cursorLine !== Console.promptLines) {
      Console.write(t, `\x1b[${Console.promptLines - this.cursorLine}B`);
      Console.cursorLine = Console.promptLines;
    }
    const totalLength = t.prompt.length + t.input.length;
    const cols = Math.max(1, t.term.cols);
    const targetCol = (totalLength % cols) + 1;
    Console.write(t, `\x1b[${targetCol}G`);
    
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
