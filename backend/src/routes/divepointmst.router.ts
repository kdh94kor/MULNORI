import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { DivePointMst } from '../entity/DivePointMst';

const router = Router();

/**
 * @swagger
 * /Set_DivePointMst_V1:
 *   post:
 *     summary: 새로운 다이빙 포인트 등록 요청
 *     description: 등록 요청된 다이빙 포인트를 등록합니다.
 *     tags: [DivePointMst]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:            
 *               pointName:
 *                 type: string
 *                 format: string
 *                 description: 포인트명
 *                 example: 하조대전망대
 *               lat:
 *                 type: number
 *                 format: double
 *                 description: 위도
 *                 example: 37.5665
 *               lot:
 *                 type: number
 *                 format: double
 *                 description: 경도
 *                 example: 126.9780
 *     responses:
 *       '201':
 *         description: 다이빙 포인트가 정상적으로 등록되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: DivePoint saved successfully
 *                 divePoint:
 *                   $ref: '#/components/schemas/DivePointMst'
 *       '400':
 *         description: 필수 필드가 누락되었거나 데이터 형식이 올바르지 않습니다.
 *       '500':
 *         description: 서버 오류.
 */
router.post('/Set_DivePointMst_V1', async (req: Request, res: Response) => {
    try {
        const {lat, lot, pointName, tags } = req.body;

        if (!lat || !lot || !pointName ) {
            return res.status(400).json({ message: '필요한 항목이 모두 입력되지 않았습니다.'} );
        }

        const divePointMstRepo = AppDataSource.getRepository(DivePointMst);
        const newDivePoint = new DivePointMst();

        newDivePoint.pointName = pointName;
        newDivePoint.lat = lat;
        newDivePoint.lot = lot;
        newDivePoint.tags = tags;

        await divePointMstRepo.save(newDivePoint);

        res.status(201).json({ message: '다이빙 포인트가 정상적으로 등록되었습니다.', divePoint: newDivePoint });

    } catch (error: any) {
        console.error('저장 오류:', error);
        res.status(500).json({ message: '다이빙 포인트 저장 중 오류 발생', error: error.message });
    }
});

/**
 * @swagger
 * /Get_DivePointMst_V1:
 *   get:
 *     summary: 저장된 다이빙 포인트 마스터 정보 조회
 *     description: 데이터베이스에 저장된 모든 다이빙 포인트 마스터 정보를 조회합니다.
 *     tags: [DivePointMst]
 *     responses:
 *       '200':
 *         description: 성공. 다이빙 포인트 마스터 정보 배열을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DivePointMst'
 *       '500':
 *         description: 서버 오류.
 */
router.get('/Get_DivePointMst_V1', async (req: Request, res: Response) => {
    try {
        const divePointMstRepo = AppDataSource.getRepository(DivePointMst);
        const divePoints = await divePointMstRepo.find();
        res.json(divePoints);
        
    } catch (error: any) {
        console.error('조회 오류:', error);
        res.status(500).json({ message: '다이빙 포인트 조회 중 오류 발생', error: error.message });
    }
});

export default router;