const colors = {
    reset: "\x1b[0m",
    error: {
        prefix: "\x1b[41m\x1b[30m",
        message: "\x1b[31m"
    },
    log: {
        prefix: "\x1b[44m\x1b[30m",
        message: "\x1b[34m"
    },
    success: {
        prefix: "\x1b[42m\x1b[30m",
        message: "\x1b[32m"
    },
    warning: {
        prefix: "\x1b[43m\x1b[30m",
        message: "\x1b[33m"
    }
};

const log = (message: string, type: 'error' | 'log' | 'success' | 'warning') => {
    const color = colors[type];
    console.log(`${color.prefix} ${type.toUpperCase()} ${colors.reset} ${color.message}${message}${colors.reset}`);
};

export default log;