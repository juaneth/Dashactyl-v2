function print(base: string, message: string | string[]): void {
    message = Array.isArray(message) ? message : message.split('\n');
    const fmt = message.map(m => `\x1b[${base}\x1B[0m: ${m}`).join('\n');
    console.log(fmt);
}

function info(message: string | string[]): void {
    print('34mINFO', message);
}

function success(message: string | string[]): void {
    print('32mSUCCESS', message);
}

function debug(message: string | string[]): void {
    print('1mDEBUG', message);
}

function warn(message: string | string[]): void {
    print('33mWARNING', message);
}

function error(message: string | string[]): void {
    print('31mERROR', message);
}

function fatal(message: string | string[]): never {
    error(message);
    process.exit(1);
}

export default {
    info,
    success,
    debug,
    warn,
    error,
    fatal
}
