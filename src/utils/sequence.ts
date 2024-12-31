import { getRepository } from 'typeorm';
import { Counter } from '../models/Counter';

export async function getNextSequenceValue(sequenceName: string): Promise<number> {
    const counterRepository = getRepository(Counter);
    let counter = await counterRepository.findOne({ where: { name: sequenceName } });

    if (!counter) {
        counter = new Counter();
        counter.name = sequenceName;
        counter.value = 0;
    }

    counter.value += 1;
    await counterRepository.save(counter);

    return counter.value;
}