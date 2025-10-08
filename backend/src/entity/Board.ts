import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BoardCategoryMaster } from "./BoardCategoryMaster";

@Entity("M_BoardMst")
export class Board {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => BoardCategoryMaster)
    @JoinColumn({ name: "category_id" })
    category!: BoardCategoryMaster;

    @Column()
    title!: string;

    @Column('text') // 내용은 길 수 있으므로 'text' 타입으로 지정
    content!: string;

    @Column()
    author!: string;

    @Column({
      type: 'int',
      nullable: true,
      default: 0,
    })
    views!: number;

    @Column({
      type: 'int',
      nullable: true,
      default: 0,
    })
    likes!: number;
}