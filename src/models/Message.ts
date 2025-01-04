import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

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

    @Column()
    ticketId!: number;

    @Column()
    staffRole!: string;
}