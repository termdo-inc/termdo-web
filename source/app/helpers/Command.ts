import type { Terminal } from "../../components/Terminal";
import { DateConstants } from "../constants/DateConstants";
import { TableConstants } from "../constants/TableConstants";
import { AuthError } from "../errors/AuthError";
import { ApiService } from "../services/ApiService";
import { Console } from "./Console";
import { Option } from "./Option";

export class Command {
  public static help(t: Terminal): void {
    Console.out(t, "Available commands:");
    Console.out(t, "  help     - Show this help message");
    Console.out(t, "  echo     - Print text to the console");
    Console.out(t, "  whoami   - Show the current username");
    Console.out(t, "  which    - Show the path of a command");
    Console.out(t, "  history  - Show command history");
    Console.out(t, "  date     - Show the current date and time");
    Console.out(t, "  su       - Switch user");
    Console.out(t, "  adduser  - Create a new user");
    Console.out(t, "  exit     - Exit the current session");
    Console.out(t, "  ls       - List tasks with sorting and filtering");
    Console.out(t, "  touch    - Create a new task");
    Console.out(t, "  cat      - View task details");
    Console.out(t, "  rm       - Delete a task");
    Console.out(t, "  edit     - Edit an existing task");
    Console.out(t, "");
    Console.out(
      t,
      "Type `<command> --help` for more information on a specific command.",
    );
  }

  public static echo(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Prints the provided text to the console.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  echo <text>");
      return;
    }
    Console.out(t, args.join(" "));
  }

  public static whoami(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Prints the current username.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  whoami");
      return;
    }
    Console.out(t, t.username);
  }

  public static which(t: Terminal, args: string[]): void {
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Prints the path of the specified command.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  which <command>");
      return;
    }
    const command = args[0];
    Console.out(t, `/usr/bin/${command}`);
  }

  public static history(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Prints the command history.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  history");
      return;
    }
    for (const historyItem of t.history) {
      Console.out(t, historyItem);
    }
  }

  public static date(t: Terminal, args: string[]): void {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Prints the current date and time.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  date");
      return;
    }
    Console.out(t, new Date().toISOString());
  }

  public static async su(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Switches to the specified user.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  su <username> [password]");
      return;
    } else if (args.length < 1) {
      Console.error(t, "Username is required.");
      return;
    } else if (args[0] !== "root" && args.length < 2) {
      Console.error(t, "Password is required for non-root users.");
      return;
    } else if (args[0] === "root") {
      await ApiService.logout();
      t.sessionEnded();
      Console.out(t, `Switched to root.`);
      return;
    }
    const result = await ApiService.login(args[0]!, args[1]!);
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    t.sessionStarted(result.get().username);
    Console.out(t, `Switched to user ${t.username}.`);
  }

  public static async adduser(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Creates a new user with the specified username.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  adduser <username> <password>");
      return;
    } else if (args.length < 2) {
      Console.error(t, "Username and password are required.");
      return;
    } else if (t.username !== "root") {
      Console.error(t, "You must be logged in as root to add a user.");
      return;
    } else if (args[0] === "root") {
      Console.error(t, "Cannot create a user with the username root.");
      return;
    }
    const result = await ApiService.signup(args[0]!, args[1]!);
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    t.sessionStarted(result.get().username);
    Console.out(t, `User ${t.username} created successfully.`);
  }

  public static async exit(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Exits the current session.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  exit");
      return;
    } else if (t.username === "root") {
      Console.error(t, "You cannot exit as the root user.");
      return;
    }
    const result = await ApiService.logout();
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    t.sessionEnded();
    Console.out(t, "Session ended");
  }

  public static async ls(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Lists tasks with sorting and filtering.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(
        t,
        "  ls [--sort <field>] [--order <asc|desc>]  [--completed <true|false>]",
      );
      Console.out(t, "");
      Console.out(t, "Fields:");
      Console.out(t, "  title         - Task title");
      Console.out(t, "  description   - Task description");
      Console.out(t, "  is-completed  - Task completion status");
      Console.out(t, "  created-at    - Task creation date");
      Console.out(t, "  updated-at    - Task last update date");
      Console.out(t, "");

      Console.out(t, "Options:");
      Console.out(
        t,
        "  -s, --sort <field>            Sort by field. Default is updated-at.",
      );
      Console.out(
        t,
        "  -o, --order <asc|desc>        Set the sort order. Default is desc.",
      );
      Console.out(
        t,
        "  -c, --completed <true|false>  Filter by completion. Default is all.",
      );
      return;
    }
    if (t.username === "root") {
      Console.error(t, "You cannot list tasks as the root user.");
      return;
    }
    const result = await ApiService.getTasks();
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    let tasks = result.get();
    tasks = tasks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const options = Option.parse(args);
    for (const opt of options) {
      if (opt.option === "sort" || opt.option === "s") {
        if (
          opt.value !== "title" &&
          opt.value !== "description" &&
          opt.value !== "is-completed" &&
          opt.value !== "created-at" &&
          opt.value !== "updated-at"
        ) {
          Console.error(
            t,
            `Invalid sort field: ${opt.value}. Use --help to see valid fields.`,
          );
          return;
        }
        tasks = tasks.sort((a, b) => {
          let fieldA: string | boolean | Date = "";
          let fieldB: string | boolean | Date = "";
          switch (opt.value) {
            case "title":
              fieldA = a.title;
              fieldB = b.title;
              break;
            case "description":
              fieldA = a.description;
              fieldB = b.description;
              break;
            case "is-completed":
              fieldA = a.isCompleted;
              fieldB = b.isCompleted;
              break;
            case "created-at":
              fieldA = a.createdAt;
              fieldB = b.createdAt;
              break;
            case "updated-at":
              fieldA = a.updatedAt;
              fieldB = b.updatedAt;
              break;
          }
          if (fieldA < fieldB) return -1;
          if (fieldA > fieldB) return 1;
          return 0;
        });
      } else if (opt.option === "order" || opt.option === "o") {
        if (opt.value !== "asc" && opt.value !== "desc") {
          Console.error(
            t,
            `Invalid sort order: ${opt.value}. Use --help to see valid orders.`,
          );
          return;
        }
        if (opt.value === "desc") {
          tasks = tasks.reverse();
        }
      } else if (opt.option === "completed" || opt.option === "c") {
        if (opt.value !== "true" && opt.value !== "false") {
          Console.error(
            t,
            `Invalid completed filter: ${opt.value}. Use --help to see valid values.`,
          );
          return;
        }
        const isCompleted = opt.value === "true";
        tasks = tasks.filter((task) => task.isCompleted === isCompleted);
      } else {
        Console.error(t, `Unknown option: ${opt.option}. Use --help for help.`);
        return;
      }
    }
    Console.out(t, `Listing ${tasks.length} tasks:`);
    Console.out(t, "");

    const columns = t.term.cols;

    let headersMinimized = false;
    const idHeader = "#";
    const titleHeader = "TITLE";
    const descriptionHeader = "DESCRIPTION";
    const createdAtHeader = "CREATED AT";
    const updatedAtHeader = "UPDATED AT";

    if (
      `| [?] | ${idHeader} | ${titleHeader} | ${descriptionHeader} | ${
        createdAtHeader
      } | ${updatedAtHeader} |`.length >
      columns / 2
    ) {
      headersMinimized = true;
    }

    let maxIdLength = idHeader.length;
    let maxTitleLength = titleHeader.length;
    let maxDescriptionLength = descriptionHeader.length;
    const maxCreatedAtLength = headersMinimized
      ? DateConstants.DATE_FORMAT.format(new Date()).length
      : DateConstants.DATE_TIME_FORMAT.format(new Date()).length;
    const maxUpdatedAtLength = maxCreatedAtLength;

    for (const task of tasks) {
      if (`${task.taskId}`.length > maxIdLength) {
        maxIdLength = `${task.taskId}`.length;
      }
      if (task.title.length > maxTitleLength) {
        maxTitleLength = task.title.length;
      }
      if (task.description.length > maxDescriptionLength) {
        maxDescriptionLength = task.description.length;
      }
    }

    const tableWidth = `| [?] | ${" ".repeat(maxIdLength)} | ${" ".repeat(
      maxTitleLength,
    )} | ${" ".repeat(maxDescriptionLength)} | ${" ".repeat(
      maxCreatedAtLength,
    )} | ${" ".repeat(maxUpdatedAtLength)} |`.length;

    if (tableWidth > columns) {
      const excess = tableWidth - columns;
      const maxTitleLengthBefore = maxTitleLength;
      const reduceMaxTitleLengthBy = Math.floor(excess / 2);
      maxTitleLength = Math.max(
        TableConstants.MIN_TITLE_WIDTH,
        maxTitleLength - reduceMaxTitleLengthBy,
      );
      const actualMaxTitleLengthReducedBy =
        maxTitleLengthBefore - maxTitleLength;
      const reduceMaxDescriptionLengthBy =
        excess - actualMaxTitleLengthReducedBy;
      maxDescriptionLength = Math.max(
        TableConstants.MIN_DESCRIPTION_WIDTH,
        maxDescriptionLength - reduceMaxDescriptionLengthBy,
      );
    }

    for (const task of tasks) {
      if (task.title.length > maxTitleLength) {
        task.title = task.title.slice(0, maxTitleLength - 3) + "...";
      }
    }
    for (const task of tasks) {
      if (task.description.length > maxDescriptionLength) {
        task.description =
          task.description.slice(0, maxDescriptionLength - 3) + "...";
      }
    }

    Console.out(
      t,
      `| [?] | ${idHeader.padEnd(maxIdLength)} | ${titleHeader.padEnd(
        maxTitleLength,
      )} | ${descriptionHeader.padEnd(
        maxDescriptionLength,
      )} | ${createdAtHeader.padEnd(
        maxCreatedAtLength,
      )} | ${updatedAtHeader.padEnd(maxUpdatedAtLength)} |`,
    );
    Console.out(
      t,
      `|-----|-${"-".repeat(maxIdLength)}-|-${"-".repeat(
        maxTitleLength,
      )}-|-${"-".repeat(
        maxDescriptionLength,
      )}-|-${"-".repeat(maxCreatedAtLength)}-|-${"-".repeat(
        maxUpdatedAtLength,
      )}-|`,
    );
    for (const task of tasks) {
      Console.out(
        t,
        `| ${task.isCompleted ? "[X]" : "[ ]"} | ${`${task.taskId}`.padEnd(
          maxIdLength,
        )} | ${task.title.padEnd(maxTitleLength)} | ${task.description.padEnd(
          maxDescriptionLength,
        )} | ${
          headersMinimized
            ? DateConstants.DATE_FORMAT.format(task.createdAt)
            : DateConstants.DATE_TIME_FORMAT.format(task.createdAt)
        } | ${
          headersMinimized
            ? DateConstants.DATE_FORMAT.format(task.updatedAt)
            : DateConstants.DATE_TIME_FORMAT.format(task.updatedAt)
        } |`,
      );
    }
  }

  public static async touch(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Creates a new task.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, `  touch "<title>" "<description>" [--completed]`);
      Console.out(t, "");

      Console.out(t, "Options:");
      Console.out(t, "  -c, --completed  Mark the task as completed");
      return;
    }
    if (t.username === "root") {
      Console.error(t, "You cannot create tasks as the root user.");
      return;
    }
    if (args.length < 2) {
      Console.error(t, "Title and description are required.");
      return;
    }
    const options = Option.parse(args);
    let isCompleted = false;
    for (const opt of options) {
      if (opt.option === "completed" || opt.option === "c") {
        isCompleted = true;
      } else {
        Console.error(t, `Unknown option: ${opt.option}. Use --help for help.`);
        return;
      }
    }
    const title = args[0]!;
    const description = args[1]!;
    const result = await ApiService.createTask(title, description, isCompleted);
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    Console.out(t, `Task "${title}" created successfully.`);
  }

  public static async cat(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Views the details of a task.");
      Console.out(t, "");

      Console.out(t, "Usage:");
      Console.out(t, "  cat <task-id>");
      return;
    }
    if (t.username === "root") {
      Console.error(t, "You cannot view tasks as the root user.");
      return;
    }
    if (args.length < 1) {
      Console.error(t, "Task ID is required.");
      return;
    }
    const taskId = Number(args[0]!);
    if (Number.isNaN(taskId) || !Number.isInteger(taskId) || taskId < 1) {
      Console.error(t, "Task ID must be a positive integer.");
      return;
    }
    const result = await ApiService.getTask(taskId);
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    const task = result.get();
    Console.out(t, "Task Details:");
    Console.out(t, `  ID          : ${task.taskId}`);
    Console.out(t, `  Title       : ${task.title}`);
    Console.out(t, `  Description : ${task.description}`);
    Console.out(t, `  Completed   : ${task.isCompleted ? "Yes" : "No"}`);
    Console.out(
      t,
      `  Created At  : ${DateConstants.DATE_TIME_FORMAT.format(
        task.createdAt,
      )}`,
    );
    Console.out(
      t,
      `  Updated At  : ${DateConstants.DATE_TIME_FORMAT.format(
        task.updatedAt,
      )}`,
    );
  }

  public static async rm(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Deletes a task.");
      Console.out(t, "");
      Console.out(t, "Usage:");
      Console.out(t, "  rm <task-id>");
      return;
    }
    if (t.username === "root") {
      Console.error(t, "You cannot delete tasks as the root user.");
      return;
    }
    if (args.length < 1) {
      Console.error(t, "Task ID is required.");
      return;
    }
    const taskId = Number(args[0]!);
    if (Number.isNaN(taskId) || !Number.isInteger(taskId) || taskId < 1) {
      Console.error(t, "Task ID must be a positive integer.");
      return;
    }
    const result = await ApiService.deleteTask(taskId);
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    Console.out(t, `Task ${taskId} deleted successfully.`);
  }

  public static async edit(t: Terminal, args: string[]): Promise<void> {
    if (args.includes("--help") || args.includes("-h")) {
      Console.out(t, "Edits an existing task.");
      Console.out(t, "");
      Console.out(t, "Usage:");
      Console.out(
        t,
        `  edit <task-id> [--title "<title>"] [--description "<description>"] [--completed <true|false>]`,
      );
      Console.out(t, "");
      Console.out(t, "Options:");
      Console.out(
        t,
        "  -t, --title <title>              New title for the task",
      );
      Console.out(
        t,
        "  -d, --description <description>  New description for the task",
      );
      Console.out(
        t,
        "  -c, --completed <true|false>     Set completion status",
      );
      return;
    }
    if (t.username === "root") {
      Console.error(t, "You cannot edit tasks as the root user.");
      return;
    }
    if (args.length < 1) {
      Console.error(t, "Task ID is required.");
      return;
    }
    const taskId = Number(args[0]!);
    if (Number.isNaN(taskId) || !Number.isInteger(taskId) || taskId < 1) {
      Console.error(t, "Task ID must be a positive integer.");
      return;
    }
    const options = Option.parse(args.slice(1));
    let title: string | undefined;
    let description: string | undefined;
    let isCompleted: boolean | undefined;
    for (const opt of options) {
      if (opt.option === "title" || opt.option === "t") {
        if (opt.value === null) {
          Console.error(t, "Title value is required.");
          return;
        }
        title = opt.value;
      } else if (opt.option === "description" || opt.option === "d") {
        if (opt.value === null) {
          Console.error(t, "Description value is required.");
          return;
        }
        description = opt.value;
      } else if (opt.option === "completed" || opt.option === "c") {
        if (opt.value !== "true" && opt.value !== "false") {
          Console.error(
            t,
            `Invalid completed value: ${opt.value}. Use true or false.`,
          );
          return;
        }
        isCompleted = opt.value === "true";
      } else {
        Console.error(t, `Unknown option: ${opt.option}. Use --help for help.`);
        return;
      }
    }
    const existingTaskResult = await ApiService.getTask(taskId);
    if (existingTaskResult.isLeft()) {
      this.handleErrors(t, existingTaskResult.get());
      return;
    }
    const existingTask = existingTaskResult.get();
    const result = await ApiService.updateTask(
      taskId,
      title ?? existingTask.title,
      description ?? existingTask.description,
      isCompleted ?? existingTask.isCompleted,
    );
    if (result.isLeft()) {
      this.handleErrors(t, result.get());
      return;
    }
    Console.out(t, `Task ${taskId} updated successfully.`);
  }

  // >-------------------------< Private Methods >--------------------------< //

  private static handleErrors(t: Terminal, errors: Error[]): void {
    if (errors.some((error) => AuthError.isAuthError(error))) {
      t.sessionExpired();
    } else {
      for (const error of errors) {
        Console.error(t, error.message);
      }
    }
  }
}
