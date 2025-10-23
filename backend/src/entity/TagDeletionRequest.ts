import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { DivePointMst } from "./DivePointMst";

@Entity("M_TagDeletionRequest")
export class TagDeletionRequest {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    divePointId!: number;

    @ManyToOne(() => DivePointMst)
    @JoinColumn({ name: "divePointId" })
    divePoint!: DivePointMst;

    @Column({ length: 50 })
    tagName!: string;

    @Column({ type: "int", default: 1 })
    requestCount!: number;

    @Column({ type: "boolean", default: false })
    is_hidden!: boolean;
}
