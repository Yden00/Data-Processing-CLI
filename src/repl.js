import readline from "node:readline/promises";
import { parseCommand } from "./utils/argParser.js";
import { cd_command, ls_command, up_command } from "./navigation.js";
import { printCurrentDirectory } from "./main.js";

export function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.on("line", async (line) => {
    if (line.trim() === ".exit") {
      rl.close();
      return;
    }

    const args = parseCommand(line);

    if (args.command === "cd") {
      const target = args.positional[0];
      if (!target) {
        console.log("Operation failed");
      } else {
        const dir_changed = await cd_command(target);
        if (dir_changed) {
          printCurrentDirectory();
        } else {
          console.log("Operation failed");
        }
      }
    } else if (args.command === "up") {
      const went_up = up_command();
      if (went_up) {
        printCurrentDirectory();
      }
    } else if (args.command === "ls") {
      const list_dir_files = await ls_command();
      list_dir_files.forEach((el) => console.log(el));
    }
    rl.prompt();
  });

  rl.prompt();
  rl.on("SIGINT", () => {
    console.log("\nThank you for using Data Processing CLI!");
    rl.close();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
