import { Entity, ObjectIdColumn, ObjectId, Column, ManyToOne } from "typeorm";
import { Ticket } from "./Ticket";

@Entity()
export class Message {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    author!: string;

    @Column()
    username!: string;

    @Column()
    message!: string;

    @Column()
    isStaff!: boolean;

    @Column()
    isAdmin!: boolean;

    @Column()
    date!: Date;

    @Column()
    authorAvatar!: string;

    @Column()
    createdAt!: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.messages, { nullable: true })
    ticket!: Ticket | null;

    @Column()
    staffRole!: string;
}