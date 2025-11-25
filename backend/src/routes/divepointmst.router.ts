import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { DivePointMst } from '../entity/DivePointMst';
import { RequestStatus } from '../constants/request-status.enum';
import swaggerJSDoc from 'swagger-jsdoc';

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
 *               tags:
 *                 type: string
 *                 format: string
 *                 description: 포인트 태그
 *                 example: {"샤워장있음","수심5m"}
 *               pointStatus:
 *                 type: string
 *                 description: 포인트 항목 상태
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: PENDING
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
        newDivePoint.pointStatus = RequestStatus.PENDING;

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
        const divePoints = await divePointMstRepo.find({
            where: {
                pointStatus: RequestStatus.APPROVED
            }
        });
        res.json(divePoints);
        
    } catch (error: any) {
        console.error('조회 오류:', error);
        res.status(500).json({ message: '다이빙 포인트 조회 중 오류 발생', error: error.message });
    }
});

/**
 * @swagger
 * /Get_DivePointMst_V2:
 *   get:
 *     summary: 저장된 다이빙 포인트 조회 V2
 *     description: 데이터베이스에 저장된 모든 다이빙 포인트 마스터 정보를 조회합니다. 승인여부 필터 적용됨
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
 *       '400':
 *         description: 유효하지 않은 승인여부
 *       '500':
 *         description: 서버 오류.
 */
router.get('/Get_DivePointMst_V2', async (req: Request, res: Response) => { // 승인, 미승인 필터 추가
    try {
        const { status } = req.query;

        const divePointMstRepo = AppDataSource.getRepository(DivePointMst);
        const whereClause: any = {}; 
        if (status) {

            const isValidStatus = Object.values(RequestStatus).includes(status as RequestStatus);

            if (isValidStatus) {

                whereClause.pointStatus = status as RequestStatus;
            } else { // status값이 enum에 해당하지 않는 경우
                return res.status(400).json({ message: '유효하지 않은 status 값입니다.' });
            }
        }
        
        const divePoints = await divePointMstRepo.find({
            where: whereClause
        });
        
        res.json(divePoints);
        
    } catch (error: any) {
        console.error('조회 오류:', error);
        res.status(500).json({ message: '다이빙 포인트 조회 중 오류 발생', error: error.message });
    }
});

/**
 * @swagger
 * /Update_DivePointMstStatus_V1/{id}:
 *   patch:
 *     summary: 다이빙 포인트 상태 업데이트
 *     description: 특정 다이빙 포인트의 승인 상태를 업데이트합니다.
 *     tags: [DivePointMst]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 다이빙 포인트의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: 업데이트할 포인트 상태
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       '200':
 *         description: 다이빙 포인트 상태가 성공적으로 업데이트되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: DivePoint status updated successfully
 *                 divePoint:
 *                   $ref: '#/components/schemas/DivePointMst'
 *       '400':
 *         description: '유효하지 않은 요청 (예: ID 누락, 유효하지 않은 상태 값).'
 *       '404':
 *         description: 해당 ID의 다이빙 포인트를 찾을 수 없습니다.
 *       '500':
 *         description: 서버 오류.
 */
router.patch('/Update_DivePointMstStatus_V1/:id', async (req: Request, res: Response) => {
    try {
        const pointId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (isNaN(pointId)) {
            return res.status(400).json({ message: '유효하지 않은 포인트 ID입니다.' });
        }

        if (!status || !Object.values(RequestStatus).includes(status)) {
            return res.status(400).json({ message: '유효하지 않거나 누락된 상태 값입니다.' });
        }

        const divePointMstRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointMstRepo.findOneBy({ id: pointId });

        if (!divePoint) {
            return res.status(404).json({ message: '해당 ID의 다이빙 포인트를 찾을 수 없습니다.' });
        }

        divePoint.pointStatus = status;
        await divePointMstRepo.save(divePoint);

        res.status(200).json({ message: '다이빙 포인트 상태가 성공적으로 업데이트되었습니다.', divePoint: divePoint });

    } catch (error: any) {
        console.error('다이빙 포인트 상태 업데이트 중 오류 발생:', error);
        res.status(500).json({ message: '다이빙 포인트 상태 업데이트 중 서버 오류 발생', error: error.message });
    }
});

/**
 * @swagger
 * /Delete_DivePointMstTag_V1/{id}:
 *   delete:
 *     summary: 다이빙 포인트 태그 삭제
 *     description: 특정 다이빙 포인트에서 지정된 태그를 삭제합니다.
 *     tags: [DivePointMst]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 다이빙 포인트의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagToDelete:
 *                 type: string
 *                 description: 삭제할 태그 이름
 *                 example: 바다
 *     responses:
 *       '200':
 *         description: 태그가 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tag deleted successfully
 *                 divePoint:
 *                   $ref: '#/components/schemas/DivePointMst'
 *       '400':
 *         description: 요청 본문에 tagToDelete가 누락되었거나 유효하지 않습니다.
 *       '404':
 *         description: 해당 ID의 다이빙 포인트를 찾을 수 없거나 삭제할 태그를 찾을 수 없습니다.
 *       '500':
 *         description: 서버 오류.
 */
router.delete('/Delete_DivePointMstTag_V1/:id', async (req: Request, res: Response) => {
    try {
        const pointId = parseInt(req.params.id, 10);
        const { tagToDelete } = req.body;

        if (isNaN(pointId)) {
            return res.status(400).json({ message: '유효하지 않은 포인트 ID입니다.' });
        }

        if (!tagToDelete) {
            return res.status(400).json({ message: '삭제할 태그 이름이 필요합니다.' });
        }

        const divePointMstRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointMstRepo.findOneBy({ id: pointId });

        if (!divePoint) {
            return res.status(404).json({ message: '해당 ID의 다이빙 포인트를 찾을 수 없습니다.' });
        }

        let tagsArray = divePoint.tags ? divePoint.tags.split(',').map(tag => tag.trim()) : [];
        const initialLength = tagsArray.length;

        tagsArray = tagsArray.filter(tag => tag !== tagToDelete);

        if (tagsArray.length === initialLength) {
            return res.status(404).json({ message: '삭제할 태그를 찾을 수 없습니다.' });
        }

        divePoint.tags = tagsArray.join(',');
        await divePointMstRepo.save(divePoint);

        res.status(200).json({ message: '태그가 성공적으로 삭제되었습니다.', divePoint: divePoint });

    } catch (error: any) {
        console.error('태그 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '태그 삭제 중 서버 오류 발생', error: error.message });
    }
});

export default router;