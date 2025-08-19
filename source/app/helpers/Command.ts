import type { Terminal } from "../../components/Terminal";
import { Console } from "./Console";
import { SessionService } from "../services/SessionService";

export class Command {
  public static help(t: Terminal): void {
    Console.out(t, "Available commands:");
    Console.out(t, "  help - Show this help message");
  }

  public static echo(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: echo <text>");
      Console.out(t, "Prints the provided text to the console.");
      return;
    }
    Console.out(t, args.join(" "));
  }

  public static whoami(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: whoami");
      Console.out(t, "Prints the current username.");
      return;
    }
    Console.out(t, t.username);
  }

  public static which(t: Terminal, args: string[]): void {
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: which <command>");
      Console.out(t, "Prints the path of the specified command.");
      return;
    }
    const command = args[0];
    Console.out(t, `/usr/bin/${command}`);
  }

  public static history(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: history");
      Console.out(t, "Prints the command history.");
      return;
    }
    for (const historyItem of t.history) {
      Console.out(t, historyItem);
    }
  }

  public static date(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: date");
      Console.out(t, "Prints the current date and time.");
      return;
    }
    Console.out(t, new Date().toISOString());
  }

  public static su(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: su <username> [<password>]");
      Console.out(t, "Switches to the specified user.");
      return;
    }
    if (args.length < 1) {
      Console.out(t, "Error: Username is required.");
      return;
    }
    if (args[0] !== "root" && args.length < 2) {
      Console.out(t, "Error: Password is required for non-root users.");
      return;
    }
    t.username = args[0]!;
    Console.out(t, `Switched to user ${t.username}.`);
  }

  public static adduser(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: adduser <username> <password>");
      Console.out(t, "Creates a new user with the specified username.");
      return;
    }
    if (args.length < 2) {
      Console.out(t, "Error: Username and password are required.");
      return;
    }
    if (t.username !== "root") {
      Console.out(t, "You must be logged in as root to add a user.");
      return;
    }
    if (args[0] === "root") {
      Console.out(t, "Error: Cannot create a user with the username 'root'.");
      return;
    }
    Console.out(t, `User ${t.username} created successfully.`);
  }

  public static exit(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Usage: exit");
      Console.out(t, "Logs out the current user.");
      return;
    }
    if (t.username === "root") {
      Console.out(t, "You cannot exit as the root user.");
      return;
    }
    // Best-effort logout via API; ignore errors and continue local state change
    void SessionService.logout();
    t.username = "root";
    Console.out(t, `Logged out.`);
  }
}
