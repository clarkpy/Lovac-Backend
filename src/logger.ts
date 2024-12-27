import chalk from 'chalk';

const log = (message: string, type: 'error' | 'log' | 'success' | 'warning') => {
    switch (type) {
        case 'error':
            console.log(chalk.bgRed.black(' ERROR '), chalk.red(message));
            break;
        case 'log':
            console.log(chalk.bgBlue.black(' LOG '), chalk.blue(message));
            break;
        case 'success':
            console.log(chalk.bgGreen.black(' SUCCESS '), chalk.green(message));
            break;
        case 'warning':
            console.log(chalk.bgYellow.black(' WARNING '), chalk.yellow(message));
            break;
        default:
            console.log(message);
            break;
    }
};

export default log;