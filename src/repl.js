import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process';

export function startRepl() {
    const rl = readline.createInterface({ input, output });
    rl.setPrompt('>  ')
    rl.prompt()
    rl.on('line', (line) => {
    console.log(`Received: ${line}`);
});
}