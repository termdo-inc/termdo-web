import type { Terminal } from "../components/Terminal";
import { Console } from "./Console";

export class Command {
  public static help(term: Terminal): void {
    Console.out(term, "Available commands:");
    Console.out(term, "  help - Show this help message");
  }

  public static echo(term: Terminal, args: string[]): void {
    Console.out(term, args.join(" "));
  }
}
