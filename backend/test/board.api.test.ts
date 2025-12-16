import request from 'supertest';
import { AppDataSource } from '../src/data-source';
import { Board } from '../src/entity/Board';
import { BoardCategoryMaster } from '../src/entity/BoardCategoryMaster';
import { app } from '../server';

describe('Board API', () => {
    let boardRepo: any;
    let categoryRepo: any;
    let testCategoryId: number;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        boardRepo = AppDataSource.getRepository(Board);
        categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

        // 테스트용 카테고리 조회 (기존 카테고리 사용)
        const existingCategory = await categoryRepo.findOne({ where: {} });
        if (existingCategory) {
            testCategoryId = existingCategory.id;
        } else {
            // 카테고리가 없으면 생성
            const newCategory = categoryRepo.create({
                name: '테스트카테고리',
                parentId: null
            });
            const saved = await categoryRepo.save(newCategory);
            testCategoryId = saved.id;
        }
    });

    afterAll(async () => {
        // 테스트 데이터 정리
        await boardRepo.delete({ author: '테스트작성자' });

        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        // 각 테스트 전 테스트 게시글 삭제
        await boardRepo.delete({ author: '테스트작성자' });
    });

    describe('POST /api/post_board_V1', () => {
        it('게시글 생성 성공', async () => {
            const newPostData = {
                title: '테스트 게시글',
                content: '테스트 내용입니다.',
                categoryId: testCategoryId,
                author: '테스트작성자'
            };

            const res = await request(app)
                .post('/api/post_board_V1')
                .send(newPostData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toEqual(newPostData.title);
            expect(res.body.content).toEqual(newPostData.content);
            expect(res.body.author).toEqual(newPostData.author);
            expect(res.body.views).toEqual(0);
            expect(res.body.likes).toEqual(0);
        });

        it('필수 필드 누락 시 400 에러 반환', async () => {
            const invalidPostData = {
                title: '테스트 게시글',
                content: '테스트 내용입니다.',
                categoryId: testCategoryId
                // author 누락
            };

            const res = await request(app)
                .post('/api/post_board_V1')
                .send(invalidPostData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('게시글 제목, 내용, 모집유형, 작성자를 모두 입력해 주세요.');
        });

        it('작성자가 빈 문자열일 때 400 에러 반환', async () => {
            const invalidPostData = {
                title: '테스트 게시글',
                content: '테스트 내용입니다.',
                categoryId: testCategoryId,
                author: ''  // 빈 문자열
            };

            const res = await request(app)
                .post('/api/post_board_V1')
                .send(invalidPostData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('게시글 제목, 내용, 모집유형, 작성자를 모두 입력해 주세요.');
        });
    });

    describe('GET /api/get_board_list_V1', () => {
        it('게시글 목록 조회 성공', async () => {
            // 테스트 게시글 생성
            const newPostData = {
                title: '테스트 게시글',
                content: '테스트 내용입니다.',
                categoryId: testCategoryId,
                author: '테스트작성자'
            };

            await request(app)
                .post('/api/post_board_V1')
                .send(newPostData);

            // 게시글 목록 조회
            const res = await request(app)
                .get('/api/get_board_list_V1');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/get_board_content_V1/:id', () => {
        it('게시글 상세 조회 성공 및 조회수 증가', async () => {
            // 테스트 게시글 생성
            const newPostData = {
                title: '테스트 게시글',
                content: '테스트 내용입니다.',
                categoryId: testCategoryId,
                author: '테스트작성자'
            };

            const createRes = await request(app)
                .post('/api/post_board_V1')
                .send(newPostData);

            const postId = createRes.body.id;

            // 게시글 상세 조회
            const res = await request(app)
                .get(`/api/get_board_content_V1/${postId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toEqual(newPostData.title);
            expect(res.body.views).toEqual(1); // 조회수 1 증가
        });

        it('존재하지 않는 게시글 조회 시 404 반환', async () => {
            const res = await request(app)
                .get('/api/get_board_content_V1/99999');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('게시글을 조회할 수 없습니다');
        });
    });
});
