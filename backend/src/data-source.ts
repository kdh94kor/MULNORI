import "reflect-metadata";
import { DataSource } from "typeorm";
import { DivePoint } from "./entity/DivePoint";
import { DivePointMst } from "./entity/DivePointMst";
import { TagDeletionRequest } from "./entity/TagDeletionRequest";
import { BoardCategoryMaster } from "./entity/BoardCategoryMaster";
import { DiveTagMst } from "./entity/DiveTagMst";
import { Board } from "./entity/Board";
import * as fs from 'fs';

const pemPath = process.env.PEM_LOCATE;
if (!pemPath) {
  throw new Error("pem을 찾을 수 없습니다.");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, 
  logging: false,
  entities: [DivePoint, DivePointMst, TagDeletionRequest, Board, BoardCategoryMaster, DiveTagMst],
  migrations: [],
  subscribers: [],
  ssl: { 
     ca: fs.readFileSync(pemPath).toString(), 
  }
});
