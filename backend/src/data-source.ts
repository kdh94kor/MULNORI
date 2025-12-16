import "reflect-metadata";
import { DataSource } from "typeorm";
import { DivePoint } from "./entity/DivePoint";
import { DivePointMst } from "./entity/DivePointMst";
import { TagDeletionRequest } from "./entity/TagDeletionRequest";
import { BoardCategoryMaster } from "./entity/BoardCategoryMaster";
import { DiveTagMst } from "./entity/DiveTagMst";
import { Board } from "./entity/Board";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [DivePoint, DivePointMst, TagDeletionRequest, Board, BoardCategoryMaster, DiveTagMst, User],
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false
  }
});
