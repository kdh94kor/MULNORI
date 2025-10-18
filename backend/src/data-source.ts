import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { DivePoint } from "./entity/DivePoint";
import { DivePointMst } from "./entity/DivePointMst";
import { TagApproval } from "./entity/TagApproval";
import { TagDeletionRequest } from "./entity/TagDeletionRequest";
import { BoardCategoryMaster } from "./entity/BoardCategoryMaster";
import { Board } from "./entity/Board";
import path from "path";
import * as fs from 'fs';

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
  entities: [DivePoint, DivePointMst, TagApproval, TagDeletionRequest, Board, BoardCategoryMaster],
  migrations: [],
  subscribers: [],
  ssl: { 
    // rejectUnauthorized: false
    //  ca: fs.readFileSync(process.env.PEM_LOCATE).toString(), 
    ca: fs.readFileSync(path.join(__dirname, '..', 'ap-southeast-2-bundle.pem')).toString(),
  }
});
