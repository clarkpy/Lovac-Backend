import { Entity, Column, OneToMany, ManyToOne, ObjectIdColumn, ObjectId } from "typeorm";
import { Message } from "./Message";
import { Team } from "./Team";

@Entity()
export class Ticket {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    id!: number;

    @Column({ type: "varchar", nullable: true })
    assignee!: string | null;

    @ManyToOne(() => Team, { nullable: true })
    assignedGroup!: Team | null;

    @Column("simple-array")
    tags!: string[];

    @Column()
    status!: string;

    @OneToMany(() => Message, (message) => message.ticketId)
    messages!: Message[];

    @Column("simple-array")
    categories!: string[];

    @Column()
    dateOpened!: Date;

    @Column({ type: "datetime", nullable: true })
    dateClosed!: Date | null;

    @Column({ type: "varchar", nullable: true })
    threadId!: string;

    @Column({ type: "varchar", nullable: true })
    ownerId!: string;
}
