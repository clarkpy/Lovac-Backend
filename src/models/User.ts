import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class User {
    @PrimaryColumn()
    discordId!: string;

    @Column()
    totalTickets!: number;

    @Column()
    openTickets!: number;

    @Column()
    isBlacklisted!: boolean;
}
