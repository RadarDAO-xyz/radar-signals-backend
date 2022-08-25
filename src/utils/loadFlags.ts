declare global {
    namespace NodeJS {
        interface Process {
            flags: {
                noAuth: boolean;
                dev: boolean;
            };
        }
    }
}

export function loadFlags() {
    const argv = process.argv.slice(2);
    process.flags = {
        noAuth: argv.includes('--no-auth'),
        dev: argv.includes('--dev')
    };
}
