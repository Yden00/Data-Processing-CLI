import * as fs from "node:fs/promises";
import { getCwd, setCwd } from "./main.js";
import path from "path";

export function up_command() {
  if (path.dirname(getCwd()) !== getCwd()) {
    setCwd(path.dirname(getCwd()));
    return true;
  } else {
    return false;
  }
}

export async function ls_command() {
  const current_dir = getCwd();
  try {
    const files = await fs.readdir(current_dir, { withFileTypes: true });
    const file_list = [];
    const directory_list = [];
    const longest = files.reduce((acc, curr) => {
      return curr.name.length > acc ? curr.name.length : acc;
    }, 0);
    files.forEach((file) => {
      if (file.isDirectory()) {
        directory_list.push(file.name.padEnd(longest + 1) + "[folder]");
      }
      if (file.isFile()) {
        file_list.push(file.name.padEnd(longest + 1) + "[file]");
      }
    });
    return [...directory_list.sort(), ...file_list.sort()];
  } catch {
    return false;
  }
}

export async function cd_command(path_to_directory) {
  const resolvedPath = path.resolve(getCwd(), path_to_directory);
  if (await directoryExists(resolvedPath)) {
    setCwd(resolvedPath);
    return true;
  } else {
    return false;
  }
}

async function directoryExists(path) {
  try {
    const info = await fs.stat(path);
    return info.isDirectory();
  } catch {
    return false;
  }
}
