import type { Terminal } from "../components/Terminal";
import { IO } from "./IO";

export class Cursor {
  public static moveRelativeToPrompt(t: Terminal): void {
    const col = t.prompt.length + t.cursorPos + 1;
    IO.write(t, `\x1b[${col}G`);
  }
}
