export interface CommandParams {
  command: string;
  args: string[];
}

export class Input {
  public static parse(input: string): CommandParams {
    const args: string[] = [];

    let cur = "";
    let inSingle = false;
    let inDouble = false;
    let escape = false;
    for (const ch of input) {
      if (escape) {
        cur += ch;
        escape = false;
        continue;
      }

      if (ch === "\\") {
        escape = true;
        continue;
      }

      if (inSingle) {
        if (ch === "'") {
          inSingle = false;
        } else {
          cur += ch;
        }
        continue;
      }

      if (inDouble) {
        if (ch === '"') {
          inDouble = false;
        } else {
          cur += ch;
        }
        continue;
      }

      if (ch === "'") {
        inSingle = true;
        continue;
      }
      if (ch === '"') {
        inDouble = true;
        continue;
      }
      if (/\s/.test(ch)) {
        if (cur.length) {
          args.push(cur);
          cur = "";
        }
        continue;
      }

      cur += ch;
    }

    if (escape) {
      cur += "\\";
    }
    if (cur.length) args.push(cur);

    const command = args.shift() ?? "";
    return { command, args };
  }
}
