import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum Gender {
    MALE = "M",
    FEMALE = "F",
    PRIVATE = "PRIVATE"
}

@Entity("M_User")
export class User {
    @PrimaryColumn()
    id!: string; // Supabase UID

    @Column({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column({
        type: "enum",
        enum: Gender,
        default: Gender.PRIVATE
    })
    gender!: Gender;

    @Column({ nullable: true })
    contact!: string;

    @Column({ nullable: true })
    location!: string; // 주활동지역 (시/군/구)

    @Column({ default: 'USER' })
    role!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
