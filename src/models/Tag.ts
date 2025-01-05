import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Tag {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    tagShort!: string;

    @Column()
    tagLong!: string;

    @Column()
    tagColor!: string;

    @Column()
    tagIcon!: string;
}