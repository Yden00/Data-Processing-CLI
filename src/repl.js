import path from "node:path";
import readline from "node:readline/promises";
import { parseCommand } from "./utils/argParser.js";
import { cd_command, ls_command, up_command } from "./navigation.js";
import { printCurrentDirectory, getCwd } from "./main.js";
import { count } from "./commands/count.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encrypt } from "./commands/encrypt.js";
import { decrypt } from "./commands/decrypt.js";
import { logStats } from "./commands/logStats.js";

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
      printCurrentDirectory();
    } else if (args.command === "count") {
      if (!args.input) {
        console.log("Invalid input");
      } else {
        const output = await count(path.resolve(getCwd(), args.input));
        if (output) {
          console.log(`Lines: ${output.lines}`);
          console.log(`Words: ${output.words}`);
          console.log(`Characters: ${output.characters}`);
          printCurrentDirectory();
        }
      }
    } else if (args.command === "csv-to-json") {
      if (!args.input || !args.output) {
        console.log("Invalid input");
      } else {
        const ok = await csvToJson(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.output),
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "json-to-csv") {
      if (!args.input || !args.output) {
        console.log("Invalid input");
      } else {
        const ok = await jsonToCsv(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.output),
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "hash") {
      if (!args.input) {
        console.log("Invalid input");
      } else {
        const ok = await hash(
          path.resolve(getCwd(), args.input),
          args.algorithm,
          Object.hasOwn(args, "save"),
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "hash-compare") {
      if (!args.input || !args.hash) {
        console.log("Invalid input");
      } else {
        const ok = await hashCompare(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.hash),
          args.algorithm,
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "encrypt") {
      if (!args.input || !args.output || !args.password) {
        console.log("Invalid input");
      } else {
        const ok = await encrypt(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.output),
          args.password,
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "decrypt") {
      if (!args.input || !args.output || !args.password) {
        console.log("Invalid input");
      } else {
        const ok = await decrypt(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.output),
          args.password,
        );
        if (ok) printCurrentDirectory();
      }
    } else if (args.command === "log-stats") {
      if (!args.input || !args.output) {
        console.log("Invalid input");
      } else {
        const ok = await logStats(
          path.resolve(getCwd(), args.input),
          path.resolve(getCwd(), args.output),
        );
        if (ok) printCurrentDirectory();
      }
    } else {
      console.log("Invalid input");
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
