import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Staff {
    @PrimaryGeneratedColumn()
    id!: number;

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