import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Counter {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    value!: number;
}