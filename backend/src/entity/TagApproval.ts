import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { DivePointMst } from "./DivePointMst";

/**
 * @swagger
 * components:
 *   schemas:
 *     TagApproval:
 *       type: object
 *       required:
 *         - id
 *         - divePointId
 *         - tagName
 *         - tagStatus
 *       properties:
 *         id:
 *           type: integer
 *           description: Tag Approval ID
 *         divePointId:
 *           type: integer
 *           description: ID of the Dive Point
 *         tagName:
 *           type: string
 *           description: Name of the tag
 *         tagStatus:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: Status of the tag approval request
 *         requestedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the request was made
 */
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
      nullable: true,
      default: null,
    })
    tagStatus!: string;

    @CreateDateColumn()
    requestedAt!: Date;
}
