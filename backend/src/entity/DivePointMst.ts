import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("M_DivePointMst")
export class DivePointMst {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("double precision")
    lat!: number;

    @Column("double precision")
    lot!: number;

    @Column({nullable: false})
    pointName!: string;

    @Column({nullable: true})
    tags!: string;

}
