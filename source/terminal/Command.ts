import type { Terminal } from "../components/Terminal";
import { IO } from "./IO";

export class Command {
  public static help(term: Terminal): void {
    IO.writeln(term, "Available commands:");
    IO.writeln(term, "  help - Show this help message");
  }
}
