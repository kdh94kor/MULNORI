import 'reflect-metadata';
import express, { Application } from 'express';
import { setupSwagger } from './swagger';

import divepointRouter from './src/routes/divepoint.router';
import divepointMstRouter from './src/routes/divepointmst.router';

export const app: Application = express();

app.use(express.json());

setupSwagger(app);

app.use('/api', divepointRouter);
app.use('/api', divepointMstRouter);

