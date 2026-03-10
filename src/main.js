import os from 'node:os'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentDir = __dirname;

export function getCwd() {
  return currentDir;
}

export function setCwd(newDir) {
  currentDir = newDir;
}
