import 'reflect-metadata';
import express, { Application } from 'express';
import { setupSwagger } from './swagger';

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