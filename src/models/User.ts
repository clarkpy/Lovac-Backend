import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class User {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    discordId!: string;

    @Column()
    totalTickets!: number;

    @Column()
    openTickets!: number;

    @Column()
    isBlacklisted!: boolean;
}
