import request from 'supertest';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { app } from '../server';

describe('User API', () => {
    let userRepo: any;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        userRepo = AppDataSource.getRepository(User);
    });

    afterAll(async () => {
        // 테스트 데이터 정리
        await userRepo.delete({ email: 'test@example.com' });

        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        // 각 테스트 전 테스트 유저 삭제
        await userRepo.delete({ email: 'test@example.com' });
    });

    describe('POST /api/users', () => {
        it('새 사용자 생성 성공', async () => {
            const newUserData = {
                id: 'test-uuid-12345',
                email: 'test@example.com',
                name: '테스트유저',
                gender: 'M',
                contact: '010-1234-5678',
                location: '서울'
            };

            const res = await request(app)
                .post('/api/users')
                .send(newUserData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.email).toEqual(newUserData.email);
            expect(res.body.name).toEqual(newUserData.name);
            expect(res.body.gender).toEqual(newUserData.gender);

            // DB 확인
            const savedUser = await userRepo.findOneBy({ id: newUserData.id });
            expect(savedUser).toBeDefined();
            expect(savedUser?.name).toEqual(newUserData.name);
        });
    });

    describe('GET /api/users/:id', () => {
        it('사용자 정보 조회 성공', async () => {
            // 먼저 사용자 생성
            const testUser = {
                id: 'test-uuid-12345',
                email: 'test@example.com',
                name: '테스트유저',
                gender: 'M',
                contact: '010-1234-5678',
                location: '서울'
            };

            await request(app)
                .post('/api/users')
                .send(testUser);

            // 사용자 조회
            const res = await request(app)
                .get(`/api/users/${testUser.id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.id).toEqual(testUser.id);
            expect(res.body.email).toEqual(testUser.email);
            expect(res.body.name).toEqual(testUser.name);
        });

        it('존재하지 않는 사용자 조회 시 404 반환', async () => {
            const res = await request(app)
                .get('/api/users/non-existent-user-id');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('사용자를 찾을 수 없습니다.');
        });
    });
});
