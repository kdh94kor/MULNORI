import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { DivePoint } from "./entity/divePoint";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // 개발 환경에서만 사용, 프로덕션에서는 migration 사용
  logging: false,
  entities: [DivePoint],
  migrations: [],
  subscribers: [],
});
