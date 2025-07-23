import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import styles from "./Terminal.module.css";

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new XTerm({
        disableStdin: false,
        cursorBlink: true,
        fontSize: 14,
        theme: { background: "#201C17" },
      });
      term.open(terminalRef.current);
      term.writeln("This is Termdo Terminal Preview");
      term.write("root> ");
      let input = "";

      term.onData((data) => {
        const code = data.charCodeAt(0);

        switch (code) {
          case 13: // Enter
            term.write("\r\n");
            term.write("root> "); // Prompt again
            input = "";
            break;

          case 127: // Backspace (DEL)
            if (input.length > 0) {
              input = input.slice(0, -1);
              term.write("\b \b"); // move back, erase, move back again
            }
            break;

          default:
            input += data;
            term.write(data);
        }
      });
    }
  }, []);

  return <div ref={terminalRef} className={styles["terminal"]} />;
}
