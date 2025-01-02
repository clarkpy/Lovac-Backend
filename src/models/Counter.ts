import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity()
export class Counter {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    name!: string;

    @Column()
    value!: number;
}