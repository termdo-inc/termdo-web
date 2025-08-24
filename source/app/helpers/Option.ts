export interface OptionWithParams {
  option: string;
  value: string | null;
}

export class Option {
  public static parse(args: string[]): OptionWithParams[] {
    const options: OptionWithParams[] = [];
    for (const [index, arg] of args.entries()) {
      if (arg.startsWith("--")) {
        if (arg.includes("=")) {
          const [optionRaw, value] = arg.split("=", 2);
          if (optionRaw === undefined || value === undefined) {
            continue;
          }
          const option = optionRaw.substring(2);
          if (option.length < 2) {
            continue;
          }
          options.push({ option, value });
        } else {
          const option = arg.substring(2);
          if (option.length < 2) {
            continue;
          }
          if (index + 1 < args.length) {
            const possibleValue = args[index + 1]!;
            if (possibleValue.startsWith("-")) {
              options.push({ option: option, value: null });
              continue;
            } else {
              options.push({ option: option, value: possibleValue });
              args.splice(index + 1, 1);
              continue;
            }
          }
          options.push({ option: option, value: null });
          continue;
        }
      } else if (arg.startsWith("-")) {
        if (arg.includes("=")) {
          const [optionRaw, value] = arg.split("=", 2);
          if (optionRaw === undefined || value === undefined) {
            continue;
          }
          const option = optionRaw.substring(1);
          if (option.length !== 1) {
            continue;
          }
          options.push({ option, value });
        } else {
          const option = arg.substring(1);
          if (option.length !== 1) {
            continue;
          }
          if (index + 1 < args.length) {
            const possibleValue = args[index + 1]!;
            if (possibleValue.startsWith("-")) {
              options.push({ option: option, value: null });
              continue;
            } else {
              options.push({ option: option, value: possibleValue });
              args.splice(index + 1, 1);
              continue;
            }
          }
          options.push({ option: option, value: null });
          continue;
        }
      }
    }
    return options;
  }
}
