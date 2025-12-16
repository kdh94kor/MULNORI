import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import { setupSwagger } from './swagger';

import categoryRouter from './src/routes/category.router';
import divepointRouter from './src/routes/divepoint.router';
import divepointMstRouter from './src/routes/divepointmst.router';
import tagRouter from './src/routes/tag.router';
import boardRouter from './src/routes/board.router';
import uploadRouter from './src/routes/upload.router';
import usersRouter from './src/routes/user.router';
import path from 'path';

export const app: Application = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/api', categoryRouter);
app.use('/api', divepointRouter);
app.use('/api', divepointMstRouter);
app.use('/api/tags', tagRouter);
app.use('/api', boardRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);


// ngrok 프리티어로 설정시
// 프론트엔드 정적 파일 서빙
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 모든 다른 요청은 index.html로 (SPA 라우팅 지원)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});