import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';

const app: Application = express();
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'connect success' });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});