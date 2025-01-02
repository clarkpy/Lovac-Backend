import { AppDataSource } from '../data-source';
import { Counter } from '../models/Counter';

export async function getNextSequenceValue(sequenceName: string): Promise<number> {
    const counterRepository = AppDataSource.getRepository(Counter);
    console.log(`Fetching counter for sequence: ${sequenceName}`);
    
    let counter = await counterRepository.findOne({ where: { name: sequenceName } });
    console.log(`Fetched counter: ${counter ? JSON.stringify(counter) : 'not found'}`);

    if (!counter) {
        counter = new Counter();
        counter.name = sequenceName;
        counter.value = 0;
        console.log(`Created new counter: ${JSON.stringify(counter)}`);
    }

    counter.value += 1;
    await counterRepository.save(counter);
    console.log(`Updated counter value: ${counter.value}`);

    return counter.value;
}