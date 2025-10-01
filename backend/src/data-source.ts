import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { DivePoint } from "./entity/DivePoint";
import { DivePointMst } from "./entity/DivePointMst";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, 
  logging: false,
  entities: [DivePoint, DivePointMst],
  migrations: [],
  subscribers: [],
});