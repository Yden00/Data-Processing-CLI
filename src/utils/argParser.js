export function parseCommand(line) {
    const [command, ...args] = line.split(' ');
    console.log(command, args)
    const args_obj = {};
    args_obj.positional = []
    for (let i = 0; i < args.length; i++) {
        if (args[i].substring(0, 2) !== '--') {
            args_obj.positional.push(args[i])
        }

        else if (args[i].substring(0, 2) === '--') {
            args_obj[args[i].slice(2)] = args[i+1];
            i++;
        }
    }
    return args_obj
}