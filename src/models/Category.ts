import { Entity, ObjectIdColumn, ObjectId, Column, OneToMany } from "typeorm";
import { Ticket } from "./Ticket";

@Entity()
export class Category {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    name!: string;

    @OneToMany(() => Ticket, (ticket) => ticket.categories)
    tickets!: Ticket[];
}
