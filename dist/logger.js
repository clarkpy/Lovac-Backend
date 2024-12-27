"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const log = (message, type) => {
    switch (type) {
        case 'error':
            console.log(chalk_1.default.bgRed.black(' ERROR '), chalk_1.default.red(message));
            break;
        case 'log':
            console.log(chalk_1.default.bgBlue.black(' LOG '), chalk_1.default.blue(message));
            break;
        case 'success':
            console.log(chalk_1.default.bgGreen.black(' SUCCESS '), chalk_1.default.green(message));
            break;
        case 'warning':
            console.log(chalk_1.default.bgYellow.black(' WARNING '), chalk_1.default.yellow(message));
            break;
        default:
            console.log(message);
            break;
    }
};
exports.default = log;
