import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { RequestStatus } from "../constants/request-status.enum";
import { DiveTagMst } from "./DiveTagMst";

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

    @ManyToMany(() => DiveTagMst, (diveTagMst) => diveTagMst.divePointMsts)
    @JoinTable()
    tags!: DiveTagMst[];

    @Column({
        type: "enum",
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    pointStatus!: RequestStatus;

}
