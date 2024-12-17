import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Ticket } from "./Ticket";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => Ticket, (ticket) => ticket.categories)
    tickets!: Ticket[];
}
