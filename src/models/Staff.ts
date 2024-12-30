import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Staff {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    discordId!: string;

    @Column()
    discordUsername!: string;

    @Column()
    discordDisplayName!: string;

    @Column()
    discordRole!: string;

    @Column()
    discordAvatar!: string;

    @Column()
    totalTickets!: number;

    @Column()
    totalOpenTickets!: number;
}