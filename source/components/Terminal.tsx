import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import styles from "../styles/Terminal.module.css";

// Simple IO surface for commands
type IO = { write: (s?: string) => void; writeln: (s?: string) => void; clear: () => void };
// Command signature
type Command = (argv: string[], io: IO, stdin?: string) => Promise<number>;

export function Terminal() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  // Readline state
  const inputRef = useRef<string>("");
  const cursorRef = useRef<number>(0);
  const histRef = useRef<string[]>([]);
  const histIdxRef = useRef<number>(-1);

  // Demo file names for completion
  const filesRef = useRef<string[]>(["readme.md", "todo.txt", "notes.md"]);

  const username = "root";
  const cwd = "~";
  const PROMPT = `${username}@termdo:${cwd}$ `;

  // Commands registry
  const commands = useRef<Record<string, Command>>({});

  useEffect(() => {
    // Init terminal
    const term = new XTerm({
      cursorBlink: true,
      disableStdin: false,
      scrollback: 5000,
      fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      lineHeight: 1.2,
      theme: { background: "#201C17", foreground: "#FDE6C4" },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    termRef.current = term;
    fitRef.current = fit;

    // IO adapter
    const io: IO = {
      write: (s = "") => term.write(s),
      writeln: (s = "") => term.write(s + "\r\n"),
      clear: () => term.write("\x1b[2J\x1b[H"),
    };

    // Commands
    commands.current = {
      help: async (_argv, io) => {
        io.writeln("Commands:");
        io.writeln("  help            Show this help");
        io.writeln("  echo [args...]  Print text");
        io.writeln("  clear           Clear screen");
        io.writeln("  date            Print current date");
        io.writeln("  whoami          Print current user");
        io.writeln("  ls              List files");
        io.writeln("  touch <name>    Create file");
        io.writeln("  rm <name>       Remove file");
        io.writeln("  tasks           Demo command (stub to your API)");
        io.writeln("Pipes supported: echo hello | echo");
        return 0;
      },
      echo: async (argv, io, stdin) => {
        const out = argv.slice(1).join(" ");
        io.writeln((out || stdin || "").replace(/\r?\n$/, ""));
        return 0;
      },
      clear: async (_argv, io) => { io.clear(); return 0; },
      date: async (_argv, io) => { io.writeln(new Date().toString()); return 0; },
      whoami: async (_argv, io) => { io.writeln(username); return 0; },
      ls: async (_argv, io) => { io.writeln(filesRef.current.join("\n")); return 0; },
      touch: async (argv, io) => {
        const name = argv[1];
        if (!name) { io.writeln("touch: missing file operand"); return 1; }
        if (!filesRef.current.includes(name)) filesRef.current.push(name);
        return 0;
      },
      rm: async (argv, io) => {
        const name = argv[1];
        if (!name) { io.writeln("rm: missing operand"); return 1; }
        const idx = filesRef.current.indexOf(name);
        if (idx === -1) { io.writeln(`rm: cannot remove '${name}': No such file`); return 1; }
        filesRef.current.splice(idx, 1); return 0;
      },
      tasks: async (_argv, io) => {
        io.writeln("- [ ] example task 1");
        io.writeln("- [x] example task 2");
        return 0;
      },
    };

    (async () => {
      try { await (document as any).fonts?.ready; } catch {}
      const host = hostRef.current;
      if (!host) return;
      host.innerHTML = "";           // StrictMode: clear any previous xterm DOM
      term.open(host);
      term.write("\x1b[?7h");        // enable wraparound (DECAWM)
      fit.fit();
      term.focus();
      io.writeln("Welcome to Termdo. Type `help` for commands.");
      promptRender();
    })();

    const disposeData = term.onData(onData(io));

    // Resize handling (container + window)
    const host = hostRef.current;
    const ro = new ResizeObserver(() => queueMicrotask(() => { fit.fit(); repaintCurrentLine(); }));
    if (host) ro.observe(host);
    const onWinResize = () => queueMicrotask(() => { fit.fit(); repaintCurrentLine(); });
    window.addEventListener("resize", onWinResize);

    return () => {
      const hostEl = hostRef.current;
      disposeData.dispose();
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
      term.dispose();
      if (hostEl) hostEl.innerHTML = ""; // StrictMode cleanup
    };
  }, []);

  // ----- Rendering helpers -----
  function promptRender() {
    const term = termRef.current; if (!term) return;
    term.write(`\r\x1b[K${PROMPT}${inputRef.current}`);
    moveCursor();
  }
  function moveCursor() {
    const term = termRef.current; if (!term) return;
    const col = PROMPT.length + cursorRef.current + 1; // 1-based
    term.write(`\x1b[${col}G`);
  }
  function repaintCurrentLine() { promptRender(); }

  // ----- Parsing & pipeline -----
  function tokenize(line: string): string[][] {
    return line.split("|").map(p => p.trim()).filter(p => p.length > 0).map(p => p.split(/\s+/));
  }

  async function runPipeline(line: string, io: IO): Promise<void> {
    const pipeline: string[][] = tokenize(line);
    let stdin: string | undefined;

    for (const [idx, argv] of pipeline.entries()) {
      if (!argv || argv.length === 0) continue;
      const name: string = argv[0] ?? "";
      const cmd: Command | undefined = commands.current[name];
      if (!cmd) { io.writeln(`command not found: ${name}`); return; }

      const isLast = idx === pipeline.length - 1;
      if (!isLast) {
        let buf = "";
        const capIO: IO = {
          ...io,
          write: (s?: string)   => { buf += (s ?? ""); },
          writeln: (s?: string) => { buf += (s ?? "") + "\n"; },
          clear: io.clear,
        };
        await cmd(argv, capIO, stdin);
        stdin = buf;
      } else {
        await cmd(argv, io, stdin);
      }
    }
  }

  // ----- onData readline -----
  function onData(io: IO) {
    return (data: string) => {
      const term = termRef.current; if (!term) return;

      // ENTER
      if (data === "\r") {
        term.write("\r\n");
        const line = inputRef.current;
        const trimmed = line.trim();
        if (trimmed && histRef.current[0] !== trimmed) histRef.current.unshift(trimmed);
        histIdxRef.current = -1;
        if (trimmed) {
          runPipeline(trimmed, io).finally(() => { inputRef.current = ""; cursorRef.current = 0; promptRender(); });
        } else { inputRef.current = ""; cursorRef.current = 0; promptRender(); }
        return;
      }

      // BACKSPACE (DEL)
      if (data === "\u007F") {
        if (cursorRef.current > 0) {
          inputRef.current = inputRef.current.slice(0, cursorRef.current - 1) + inputRef.current.slice(cursorRef.current);
          cursorRef.current -= 1; promptRender();
        }
        return;
      }

      // ESC sequences (arrows, home/end, alt combos)
      if (data.startsWith("\x1b")) {
        switch (data) {
          case "\x1b[A": { // Up
            const next = histRef.current[histIdxRef.current + 1];
            if (next != null) { histIdxRef.current += 1; inputRef.current = next; cursorRef.current = inputRef.current.length; promptRender(); }
            return;
          }
          case "\x1b[B": { // Down
            if (histIdxRef.current > 0) { histIdxRef.current -= 1; inputRef.current = histRef.current[histIdxRef.current]; }
            else { histIdxRef.current = -1; inputRef.current = ""; }
            cursorRef.current = inputRef.current.length; promptRender(); return;
          }
          case "\x1b[C": { cursorRef.current = Math.min(cursorRef.current + 1, inputRef.current.length); moveCursor(); return; }
          case "\x1b[D": { cursorRef.current = Math.max(0, cursorRef.current - 1); moveCursor(); return; }
          case "\x1b[H": case "\x1bOH": { cursorRef.current = 0; moveCursor(); return; }
          case "\x1b[F": case "\x1bOF": { cursorRef.current = inputRef.current.length; moveCursor(); return; }
          case "\x1bb": { cursorRef.current = moveWordLeft(inputRef.current, cursorRef.current); moveCursor(); return; }
          case "\x1bf": { cursorRef.current = moveWordRight(inputRef.current, cursorRef.current); moveCursor(); return; }
          default: return; // ignore others
        }
      }

      // Control characters (Ctrl-*)
      if (data.length === 1 && data.charCodeAt(0) <= 31) {
        const ch = data.charCodeAt(0);
        if (ch === 1) { cursorRef.current = 0; moveCursor(); return; }                         // Ctrl-A
        if (ch === 5) { cursorRef.current = inputRef.current.length; moveCursor(); return; }   // Ctrl-E
        if (ch === 21) { inputRef.current = inputRef.current.slice(cursorRef.current); cursorRef.current = 0; promptRender(); return; } // Ctrl-U
        if (ch === 11) { inputRef.current = inputRef.current.slice(0, cursorRef.current); promptRender(); return; }                     // Ctrl-K
        if (ch === 23) { const p = moveWordLeft(inputRef.current, cursorRef.current); inputRef.current = inputRef.current.slice(0, p) + inputRef.current.slice(cursorRef.current); cursorRef.current = p; promptRender(); return; } // Ctrl-W
        if (ch === 12) { io.clear(); promptRender(); return; } // Ctrl-L
        return;
      }

      // Tab completion
      if (data === "\t") {
        const isFirstToken = inputRef.current.trimStart().indexOf(" ") === -1;
        const pool = isFirstToken ? Object.keys(commands.current) : filesRef.current;
        const left = inputRef.current.slice(0, cursorRef.current);
        const right = inputRef.current.slice(cursorRef.current);
        const lastSpace = left.lastIndexOf(" ");
        const tokenStart = lastSpace + 1;
        const token = left.slice(tokenStart);
        const matches = pool.filter(x => x.startsWith(token));
        if (matches.length === 1) {
          const completion: string = matches[0] as string; // definite string
          const completedLeft = left.slice(0, tokenStart) + completion + (isFirstToken ? " " : "");
          inputRef.current = completedLeft + right;
          cursorRef.current = completedLeft.length; promptRender();
        } else if (matches.length > 1) {
          term.write("\r\n" + matches.join("  ") + "\r\n");
          promptRender();
        }
        return;
      }

      // Regular printable text (including paste)
      inputRef.current = inputRef.current.slice(0, cursorRef.current) + data + inputRef.current.slice(cursorRef.current);
      cursorRef.current += data.length; promptRender();
    };
  }

  return (
    <section className={styles["terminal-container"]}>
      <div ref={hostRef} className={styles["terminal"]} />
    </section>
  );
}

// ----- helpers -----
function moveWordLeft(s: string, pos: number) {
  if (pos === 0) return 0;
  let i = pos - 1;
  while (i > 0 && s[i] === " ") i--;
  while (i > 0 && s[i - 1] !== " ") i--;
  return i;
}
function moveWordRight(s: string, pos: number) {
  if (pos >= s.length) return s.length;
  let i = pos;
  while (i < s.length && s[i] === " ") i++;
  while (i < s.length && s[i] !== " ") i++;
  return i;
}
