import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm, type IDisposable } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { Component, createRef } from "react";
import styles from "../styles/Terminal.module.css";
import { Ansi } from "../terminal/Ansi";
import { Command } from "../terminal/Command";
import { Console } from "../terminal/Console";
import { Input, type CommandParams } from "../terminal/Input";
import { Key } from "../terminal/Key";

export class Terminal extends Component {
  // Constants
  public static readonly HOSTNAME: string = "termdo";
  public static readonly CWD: string = "~";
  public static readonly MARK: string = "#";

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
  public get cursorPos() {
    return this._cursorPos;
  }
  public get prompt() {
    return `${this.username}@${Terminal.HOSTNAME}:${Terminal.CWD}${Terminal.MARK} `;
  }

  // Setters
  public set username(value: string) {
    this._username = value;
  }
  public set input(value: string) {
    this._input = value;
  }
  public set cursorPos(value: number) {
    this._cursorPos = value;
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
      convertEol: true,
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

    if (data.length > 1 && !data.startsWith(Ansi.ESCAPE)) {
      const text = data
        .replace(/\x1b\[200~|\x1b\[201~/g, "")
        .replace(/\r\n?|\n/g, " ")
        .trim();

      if (text.length) {
        this._input =
          this._input.slice(0, this._cursorPos) +
          text +
          this._input.slice(this._cursorPos);
        this._cursorPos += text.length;
        Console.prompt(this);
      }
      return;
    }

    switch (data) {
      case Key.ENTER: {
        Console.enter(this);
        const line = this._input.trim();
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
        if (data.startsWith(Ansi.ESCAPE)) {
          switch (data) {
            case Key.UP: {
              const next = this._history[this._historyIndex + 1];
              if (next !== undefined) {
                this._historyIndex += 1;
                this._input = next;
                this._cursorPos = this._input.length;
                Console.prompt(this);
              }
              break;
            }
            case Key.DOWN: {
              if (this._historyIndex > 0) {
                this._historyIndex -= 1;
                this._input = this._history[this._historyIndex]!;
              } else {
                this._historyIndex = -1;
                this._input = "";
              }
              this._cursorPos = this._input.length;
              Console.prompt(this);
              break;
            }
            case Key.LEFT: {
              Console.moveCursorLeft(this);
              break;
            }
            case Key.RIGHT: {
              Console.moveCursorRight(this);
              break;
            }
            case Key.HOME: {
              Console.moveCursorHome(this);
              break;
            }
            case Key.END: {
              Console.moveCursorEnd(this);
              break;
            }
          }
        } else {
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
