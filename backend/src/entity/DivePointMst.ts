import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { RequestStatus } from "../constants/request-status.enum";

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

    @Column({
        type: "enum",
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    pointStatus!: RequestStatus;

}
