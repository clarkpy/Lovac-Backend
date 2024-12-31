import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Counter {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    name: string = "";

    @Column()
    value: number = 0;
}