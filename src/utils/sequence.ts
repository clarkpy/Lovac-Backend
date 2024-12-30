import { Counter } from "../models/Counter";
import { AppDataSource } from "../data-source";

export const getNextSequenceValue = async (sequenceName: string): Promise<number> => {
    const counterRepository = AppDataSource.getMongoRepository(Counter);
    const counter = await counterRepository.findOne({ where: { name: sequenceName } });

    if (!counter) {
        const newCounter = new Counter();
        newCounter.name = sequenceName;
        newCounter.value = 1;
        await counterRepository.save(newCounter);
        return 1;
    } else {
        counter.value += 1;
        await counterRepository.save(counter);
        return counter.value;
    }
};