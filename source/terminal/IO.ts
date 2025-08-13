import type { Terminal } from "../components/Terminal";

export class IO {
  public static write(t: Terminal, output: string): void {
    t.term.write(output);
  }

  public static writeln(t: Terminal, output: string): void {
    t.term.write(`${output}\r\n`);
  }

  public static clear(t: Terminal): void {
    t.term.writeln("\x1b[2J\x1b[0f");
  }
}
