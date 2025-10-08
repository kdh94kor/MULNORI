import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { DivePointMst } from "./DivePointMst";

export type ApprovalStatus = "pending" | "approved" | "rejected";

@Entity("M_TagApproval")
export class TagApproval {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    divePointId!: number;

    @ManyToOne(() => DivePointMst)
    @JoinColumn({ name: "divePointId" })
    divePoint!: DivePointMst;

    @Column({ length: 50 })
    tagName!: string;

    @Column({
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    })
    status!: ApprovalStatus;

    @CreateDateColumn()
    requestedAt!: Date;
}
