import request from 'supertest';
import { AppDataSource } from '../src/data-source';
import { DivePointMst } from '../src/entity/DivePointMst';
import { app } from '../server';

describe('DivePointMst API', () => {
  let divePointMstRepo: any;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    divePointMstRepo = AppDataSource.getRepository(DivePointMst);
  });

  afterAll(async () => {
    await divePointMstRepo.clear();

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await divePointMstRepo.clear();
  });

  it('새 다이빙포인트 추가하기', async () => {
    const newDivePointData = {
      pointName: '노들섬',
      lat: 37.518893,
      lot: 126.954888,
      tags: '{"한강","똥물","다이빙이 가능할리가"}'
    };

    const res = await request(app)
      .post('/api/Set_DivePointMst_V1')
      .send(newDivePointData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('다이빙 포인트가 정상적으로 등록되었습니다.');
    expect(res.body.divePoint).toHaveProperty('id');
    expect(res.body.divePoint.pointName).toEqual(newDivePointData.pointName);
    expect(res.body.divePoint.lat).toEqual(newDivePointData.lat);
    expect(res.body.divePoint.lot).toEqual(newDivePointData.lot);
    expect(res.body.divePoint.tags).toEqual(newDivePointData.tags);

    //DB 확인
    const savedDivePoint = await divePointMstRepo.findOneBy({ id: res.body.divePoint.id });
    expect(savedDivePoint).toBeDefined();
    expect(savedDivePoint?.pointName).toEqual(newDivePointData.pointName);
  });

  it('필수 값 입력 체크', async () => {
    const invalidDivePointData = {
      pointName: '노들섬',
      lat: 37.518893
    };

    const res = await request(app)
      .post('/api/Set_DivePointMst_V1')
      .send(invalidDivePointData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('필요한 항목이 모두 입력되지 않았습니다.');
  });
});