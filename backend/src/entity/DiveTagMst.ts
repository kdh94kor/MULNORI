import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { DivePointMst } from "./DivePointMst";
import { RequestStatus } from "../constants/request-status.enum";

@Entity("M_DivTagMst")
export class DiveTagMst {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) 
  name!: string; // 태그명

  @Column() 
  tagtype!: string; // 태그타입

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  tagStatus!: RequestStatus;

  @ManyToMany(() => DivePointMst, (divePointMst) => divePointMst.tags)
  divePointMsts!: DivePointMst[];

}
