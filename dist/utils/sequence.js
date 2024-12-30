"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextSequenceValue = void 0;
const Counter_1 = require("../models/Counter");
const data_source_1 = require("../data-source");
const getNextSequenceValue = (sequenceName) => __awaiter(void 0, void 0, void 0, function* () {
    const counterRepository = data_source_1.AppDataSource.getMongoRepository(Counter_1.Counter);
    const counter = yield counterRepository.findOne({ where: { name: sequenceName } });
    if (!counter) {
        const newCounter = new Counter_1.Counter();
        newCounter.name = sequenceName;
        newCounter.value = 1;
        yield counterRepository.save(newCounter);
        return 1;
    }
    else {
        counter.value += 1;
        yield counterRepository.save(counter);
        return counter.value;
    }
});
exports.getNextSequenceValue = getNextSequenceValue;
