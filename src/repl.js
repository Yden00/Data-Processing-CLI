import readline from 'node:readline/promises'
import { parseCommand } from './utils/argParser.js';

export function startRepl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    rl.on('line', (line) => {
        if (line.trim() === '.exit') {
            rl.close();
        } else {
            console.log(`Command received: ${JSON.stringify(parseCommand(line))}`);
            rl.prompt();
        }
    });

    rl.prompt()
    rl.on('SIGINT', () => {
        console.log('\nThank you for using Data Processing CLI!');
        rl.close();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}