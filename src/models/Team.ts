import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Team {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    name!: string;

    @Column()
    color!: string;

    @Column()
    icon!: string;

    @Column("simple-array")
    members!: string[];
}
