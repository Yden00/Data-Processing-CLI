import { fileURLToPath } from 'url';
import path from 'path';
import { startRepl } from './repl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentDir = __dirname;

async function main() {
    printWelcome();
    printCurrentDirectory();
    startRepl();
}

function printWelcome() {
    console.log('Welcome to Data Processing CLI!');
}

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDir}`);
}

export function getCwd() {
  return currentDir;
}

export function setCwd(newDir) {
  currentDir = newDir;
}

main();
