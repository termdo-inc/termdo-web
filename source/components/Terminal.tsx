import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import styles from "./Terminal.module.css";

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm>(null);
  const fitAddon = useRef<FitAddon>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    terminal.current = new XTerm({
      cursorBlink: true,
      disableStdin: false,
      scrollback: 0,
      theme: {
        background: "#201C17",
        foreground: "#dcdcdc",
      },
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();
    terminal.current.write("Welcome to the termdo!\r\n");
    prompt();
    terminal.current.focus();

    const handleResize = () => {
      fitAddon.current?.fit();
    };
    window.addEventListener("resize", handleResize);

    let input = "";
    terminal.current.onData((data) => {
      const code = data.charCodeAt(0);

      switch (code) {
        case 13: // ENTER
          terminal.current?.write("\r\n");
          const trimmed = input.trim();
          if (trimmed) handleCommand(trimmed);
          input = "";
          prompt(); // Show next prompt
          break;

        case 127: // BACKSPACE
          if (input.length > 0) {
            input = input.slice(0, -1);
            terminal.current?.write("\b \b");
          }
          break;

        default:
          input += data;
          terminal.current?.write(data);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.current?.dispose();
    };
  }, []);

  const prompt = () => {
    terminal.current?.write("root@termdo.com> ");
  };

  const handleCommand = (raw: string) => {
    const [command, ...args] = raw.split(/\s+/);

    switch (command) {
      case "help":
        terminal.current?.writeln("Available commands: help, clear, echo");
        break;

      case "clear":
        terminal.current?.clear();
        break;

      case "echo":
        terminal.current?.writeln(args.join(" "));
        break;

      default:
        terminal.current?.writeln(`Unknown command: ${command}`);
    }
  };

  return <div ref={terminalRef} className={styles["terminal"]} />;
}
