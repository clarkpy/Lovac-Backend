import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    tagShort!: string; // [Example] "Dev App"

    @Column()
    tagLong!: string; // [Example] "Developer Application"

    @Column()
    tagColor!: string; // [Example] "#FF0000"

    @Column()
    tagIcon!: string; // [Example] "🛠️"
}