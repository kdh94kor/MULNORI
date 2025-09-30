import 'reflect-metadata';
import express, { Application } from 'express';
import { setupSwagger } from './swagger';
import { AppDataSource } from './src/data-source'; // Added import
import { DivePointMst } from './src/entity/DivePointMst';

import divepointRouter from './src/routes/divepoint.router';
import divepointMstRouter from './src/routes/divepointmst.router';

export const app: Application = express();

app.use(express.json());

setupSwagger(app);

app.use('/api', divepointRouter);
app.use('/api', divepointMstRouter);


AppDataSource.initialize().then(() => {

}).catch((err) => {
    console.error("DB Init Error", err);
    process.exit(1);
});

