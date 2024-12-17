import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    color!: string;

    @Column()
    icon!: string;

    @Column("simple-array")
    members!: string[];
}
