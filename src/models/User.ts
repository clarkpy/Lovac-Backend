import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class User {
    @Column()
    discordId!: string;

    @Column()
    totalTickets!: number;

    @Column()
    openTickets!: number;

    @Column()
    isBlacklisted!: boolean;
}
