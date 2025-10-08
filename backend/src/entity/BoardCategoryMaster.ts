import { Entity, PrimaryGeneratedColumn, Column, Tree, TreeChildren, TreeParent } from "typeorm";

@Entity("M_BoardCatMst")
@Tree("closure-table")
export class BoardCategoryMaster {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @TreeParent()
    parent!: BoardCategoryMaster;

    @TreeChildren()
    children!: BoardCategoryMaster[];
}
