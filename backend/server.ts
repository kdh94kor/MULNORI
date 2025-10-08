import 'reflect-metadata';
import express, { Application } from 'express';
import { setupSwagger } from './swagger';
import { AppDataSource } from './src/data-source'; // Added import
import { DivePointMst } from './src/entity/DivePointMst';

import categoryRouter from './src/routes/category.router';
import divepointRouter from './src/routes/divepoint.router';
import divepointMstRouter from './src/routes/divepointmst.router';
import boardRouter from './src/routes/board.router';

export const app: Application = express();

app.use(express.json());

setupSwagger(app);

/* 라우터 */
app.use('/api', categoryRouter);
app.use('/api', divepointRouter);
app.use('/api', divepointMstRouter);
app.use('/api', boardRouter);
app.use('/api', divepointRouter);
app.use('/api', divepointMstRouter);


AppDataSource.initialize().then(() => {

}).catch((err) => {
    console.error("DB Init Error", err);
    process.exit(1);
});
