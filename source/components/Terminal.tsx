import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm, type IDisposable } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { Component, createRef } from "react";
import styles from "../styles/Terminal.module.css";
import { Command } from "../terminal/Command";
import { Console } from "../terminal/Console";
import { Input, type CommandParams } from "../terminal/Input";
import { Key } from "../terminal/Key";

export class Terminal extends Component {
  // Constants
  public static readonly HOSTNAME: string = "termdo";
  public static readonly CWD: string = "~";

  // Properties
  private _hostRef = createRef<HTMLDivElement>();

  private _term: XTerm | null = null;
  private _fit: FitAddon | null = null;

  private _onDataDisposer: IDisposable | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _resizeFrameId: number = 0;

  private _username: string;
  private _input: string;
  private _cursorPos: number;
  private _history: string[];
  private _historyIndex: number;

  // Getters
  public get term(): XTerm {
    if (!this._term) {
      throw new Error("Terminal is not initialized.");
    }
    return this._term;
  }
  public get username() {
    return this._username;
  }
  public get input() {
    return this._input;
  }
  public get prompt() {
    return `${this.username}@${Terminal.HOSTNAME}:${Terminal.CWD}$ `;
  }

  // Setters
  public set username(value: string) {
    this._username = value;
  }
  public set input(value: string) {
    this._input = value;
  }

  constructor(props: {}) {
    super(props);

    this._username = "root";
    this._input = "";
    this._cursorPos = 0;
    this._history = [];
    this._historyIndex = -1;
  }

  override componentDidMount(): void {
    // Ensure hostRef is set
    if (!this._hostRef.current) {
      throw new Error("Host reference is not set.");
    }

    // Initialize
    this._term = new XTerm({
      cursorBlink: true,
      disableStdin: false,
      scrollback: 5000,
      fontFamily: "Cascadia Code, monospace",
      fontSize: 14,
      lineHeight: 1.2,
      cursorStyle: "bar",
      cursorWidth: 2,
      theme: {
        background: "#201C17",
        foreground: "#CECDCC",
        cursor: "#BE862D",
        cursorAccent: "#000000",
        selectionBackground: "#312E29",
        selectionForeground: "#CECDCC",
        selectionInactiveBackground: "#2D2A26",
        black: "#4D4945",
        brightBlack: "#706E6B",
        red: "#EF6363",
        brightRed: "#D19797",
        blue: "#4B9ECD",
        brightBlue: "#87ABC0",
        cyan: "#46A598",
        brightCyan: "#83AEA8",
        green: "#45AA41",
        brightGreen: "#80B27F",
        magenta: "#ED63BA",
        brightMagenta: "#CD95B8",
        yellow: "#BFAF40",
        brightYellow: "#ADA77F",
        white: "#989794",
        brightWhite: "#CECDCC",
      },
    });
    this._fit = new FitAddon();
    this.term.loadAddon(this._fit);
    this._term.open(this._hostRef.current);

    // Setup
    document.fonts.ready.then(async () => {
      this._fit?.fit();
      this._term?.focus();
    });

    // Initial prompt
    Console.welcome(this);
    Console.prompt(this);

    // Listeners
    this._onDataDisposer = this._term.onData(this.onData.bind(this));
    this._resizeObserver = new ResizeObserver(this.onResize.bind(this));
    this._resizeObserver.observe(this._hostRef.current);
  }

  override render() {
    return (
      <section className={styles["terminal-container"]}>
        <div ref={this._hostRef} className={styles["terminal"]} />
      </section>
    );
  }

  override componentWillUnmount(): void {
    this._onDataDisposer?.dispose();
    this._resizeObserver?.disconnect();
    this._fit?.dispose();
    this._term?.dispose();
  }

  // >-----------------------------< Methods  ------------------------------< //

  private onResize(): void {
    if (this._resizeFrameId !== 0) {
      return;
    }
    this._resizeFrameId = requestAnimationFrame(() => {
      this._resizeFrameId = 0;
      this._fit?.fit();
      Console.prompt(this);
    });
  }

  private onData(data: string): void {
    if (this._term === null) {
      console.error("Terminal is not initialized.");
      return;
    }

    switch (data) {
      case Key.ENTER: {
        Console.out(this, "");
        const line = this.input.trim();
        if (line.length > 0) {
          if (this._history[0] !== line) {
            this._history.unshift(line);
          }
        }
        this._historyIndex = -1;
        this.onCommand(Input.parse(line));
        this._input = "";
        this._cursorPos = 0;
        Console.prompt(this);
        break;
      }
      case Key.BACKSPACE: {
        if (this._cursorPos > 0) {
          this._input =
            this._input.slice(0, this._cursorPos - 1) +
            this._input.slice(this._cursorPos);
          this._cursorPos -= 1;
          Console.prompt(this);
        }
        break;
      }
      default: {
        if (!data.startsWith("\x1b")) {
          this._input =
            this._input.slice(0, this._cursorPos) +
            data +
            this._input.slice(this._cursorPos);
          this._cursorPos += data.length;

          Console.prompt(this);
        }
        break;
      }
    }
  }

  private onCommand(params: CommandParams): void {
    switch (params.command) {
      case "": {
        // Empty command, do nothing
        return;
      }
      case "help": {
        Command.help(this);
        break;
      }
      case "clear": {
        Console.clear(this);
        return;
      }
      case "echo": {
        Command.echo(this, params.args);
        break;
      }
      default: {
        Console.out(this, `Unknown command: ${params.command}`);
        break;
      }
    }
    Console.out(this, "");
  }
}

// export function Terminal2() {

//   // ----- onData readline -----
//   function onData(io: IO) {
//     return (data: string) => {
//       const term = termRef.current;
//       if (!term) return;

//       // ESC sequences (arrows, home/end, alt combos)
//       if (data.startsWith("\x1b")) {
//         switch (data) {
//           case "\x1b[A": {
//             // Up
//             const next = histRef.current[histIdxRef.current + 1];
//             if (next != null) {
//               histIdxRef.current += 1;
//               inputRef.current = next;
//               cursorRef.current = inputRef.current.length;
//               promptRender();
//             }
//             return;
//           }
//           case "\x1b[B": {
//             // Down
//             if (histIdxRef.current > 0) {
//               histIdxRef.current -= 1;
//               inputRef.current = histRef.current[histIdxRef.current];
//             } else {
//               histIdxRef.current = -1;
//               inputRef.current = "";
//             }
//             cursorRef.current = inputRef.current.length;
//             promptRender();
//             return;
//           }
//           case "\x1b[C": {
//             cursorRef.current = Math.min(
//               cursorRef.current + 1,
//               inputRef.current.length,
//             );
//             moveCursor();
//             return;
//           }
//           case "\x1b[D": {
//             cursorRef.current = Math.max(0, cursorRef.current - 1);
//             moveCursor();
//             return;
//           }
//           case "\x1b[H":
//           case "\x1bOH": {
//             cursorRef.current = 0;
//             moveCursor();
//             return;
//           }
//           case "\x1b[F":
//           case "\x1bOF": {
//             cursorRef.current = inputRef.current.length;
//             moveCursor();
//             return;
//           }
//           case "\x1bb": {
//             cursorRef.current = moveWordLeft(
//               inputRef.current,
//               cursorRef.current,
//             );
//             moveCursor();
//             return;
//           }
//           case "\x1bf": {
//             cursorRef.current = moveWordRight(
//               inputRef.current,
//               cursorRef.current,
//             );
//             moveCursor();
//             return;
//           }
//           default:
//             return; // ignore others
//         }
//       }

//       // Control characters (Ctrl-*)
//       if (data.length === 1 && data.charCodeAt(0) <= 31) {
//         const ch = data.charCodeAt(0);
//         if (ch === 1) {
//           cursorRef.current = 0;
//           moveCursor();
//           return;
//         } // Ctrl-A
//         if (ch === 5) {
//           cursorRef.current = inputRef.current.length;
//           moveCursor();
//           return;
//         } // Ctrl-E
//         if (ch === 21) {
//           inputRef.current = inputRef.current.slice(cursorRef.current);
//           cursorRef.current = 0;
//           promptRender();
//           return;
//         } // Ctrl-U
//         if (ch === 11) {
//           inputRef.current = inputRef.current.slice(0, cursorRef.current);
//           promptRender();
//           return;
//         } // Ctrl-K
//         if (ch === 23) {
//           const p = moveWordLeft(inputRef.current, cursorRef.current);
//           inputRef.current =
//             inputRef.current.slice(0, p) +
//             inputRef.current.slice(cursorRef.current);
//           cursorRef.current = p;
//           promptRender();
//           return;
//         } // Ctrl-W
//         if (ch === 12) {
//           io.clear();
//           promptRender();
//           return;
//         } // Ctrl-L
//         return;
//       }

//       // Tab completion
//       if (data === "\t") {
//         const isFirstToken = inputRef.current.trimStart().indexOf(" ") === -1;
//         const pool = isFirstToken
//           ? Object.keys(commands.current)
//           : filesRef.current;
//         const left = inputRef.current.slice(0, cursorRef.current);
//         const right = inputRef.current.slice(cursorRef.current);
//         const lastSpace = left.lastIndexOf(" ");
//         const tokenStart = lastSpace + 1;
//         const token = left.slice(tokenStart);
//         const matches = pool.filter((x) => x.startsWith(token));
//         if (matches.length === 1) {
//           const completion: string = matches[0] as string; // definite string
//           const completedLeft =
//             left.slice(0, tokenStart) + completion + (isFirstToken ? " " : "");
//           inputRef.current = completedLeft + right;
//           cursorRef.current = completedLeft.length;
//           promptRender();
//         } else if (matches.length > 1) {
//           term.write("\r\n" + matches.join("  ") + "\r\n");
//           promptRender();
//         }
//         return;
//       }

//       // Regular printable text (including paste)
//       inputRef.current =
//         inputRef.current.slice(0, cursorRef.current) +
//         data +
//         inputRef.current.slice(cursorRef.current);
//       cursorRef.current += data.length;
//       promptRender();
//     };
//   }

//   return (
//     <section className={styles["terminal-container"]}>
//       <div ref={parentRef} className={styles["terminal"]} />
//     </section>
//   );
// }

// // ----- helpers -----
// function moveWordLeft(s: string, pos: number) {
//   if (pos === 0) return 0;
//   let i = pos - 1;
//   while (i > 0 && s[i] === " ") i--;
//   while (i > 0 && s[i - 1] !== " ") i--;
//   return i;
// }
// function moveWordRight(s: string, pos: number) {
//   if (pos >= s.length) return s.length;
//   let i = pos;
//   while (i < s.length && s[i] === " ") i++;
//   while (i < s.length && s[i] !== " ") i++;
//   return i;
// }
