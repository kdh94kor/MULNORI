import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { DivePointMst } from "./DivePointMst";

@Entity("M_DivTagMst")
export class DiveTagMst {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column() 
  name!: string; // 태그명

  @Column() 
  type!: string; // 태그타입

  // @OneToMany(() => DivePointMst, (divePoint) => divePoint.tags)
  // divePoints!: DivePointMst[];


}
