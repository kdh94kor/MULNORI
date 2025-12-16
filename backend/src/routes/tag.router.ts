import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { DivePointMst } from '../entity/DivePointMst';
import { TagDeletionRequest } from '../entity/TagDeletionRequest';
import { DiveTagMst } from '../entity/DiveTagMst';
import { RequestStatus } from '../constants/request-status.enum';

const router = Router();

router.post('/deletion-requests', async (req: Request, res: Response) => {
    try {
        const { divePointId, tagName } = req.body;

        if (!divePointId || !tagName) {
            return res.status(400).json({ message: '다이빙포인트 ID와 태그 이름은 필수 항목입니다.' });
        }

        // Check if the DivePointMst actually exists
        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointRepo.findOne({
            where: { id: divePointId },
            relations: ["tags"], // Load associated tags
        });
        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        // Check if the tag to be deleted actually exists on the point
        const existingTags = divePoint.tags.map(tag => tag.name);
        if (!existingTags.includes(tagName)) {
            return res.status(404).json({ message: '삭제하려는 태그가 해당 포인트에 존재하지 않습니다.' });
        }

        const deletionRepo = AppDataSource.getRepository(TagDeletionRequest);
        let deletionRequest = await deletionRepo.findOne({
            where: {
                divePointId: divePointId,
                tagName: tagName,
            }
        });

        if (deletionRequest) {
            // 이미 삭제요청이 있을경우 요청횟수 1회 추가
            deletionRequest.requestCount += 1;
            await deletionRepo.save(deletionRequest);
        } else {
            // If it does not exist, create a new one
            deletionRequest = new TagDeletionRequest();
            deletionRequest.divePointId = divePointId;
            deletionRequest.tagName = tagName;

            await deletionRepo.save(deletionRequest);
        }

        res.status(200).json({ message: '태그 삭제 요청이 접수되었습니다.' });

    } catch (error: any) {
        console.error('Error requesting tag deletion:', error);
        res.status(500).json({ message: '태그 삭제 요청에 실패했습니다.', error: error.message });
    }
});

// 태그 추가 요청
router.post('/requests', async (req: Request, res: Response) => {
    try {
        const { divePointId, tagName } = req.body;

        if (!divePointId || !tagName) {
            return res.status(400).json({ message: '다이빙포인트 ID와 태그 이름은 필수 항목입니다.' });
        }

        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const diveTagMstRepo = AppDataSource.getRepository(DiveTagMst);

        // 다이빙 포인트 확인
        const divePoint = await divePointRepo.findOne({
            where: { id: divePointId },
            relations: ["tags"],
        });

        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        // 태그가 이미 존재하는지 확인
        let diveTag = await diveTagMstRepo.findOne({
            where: { name: tagName },
        });

        if (diveTag) {
            // 태그가 이미 존재하면 해당 포인트에 이미 연결되어 있는지 확인
            const alreadyAssociated = divePoint.tags.some(tag => tag.id === diveTag!.id);
            if (alreadyAssociated) {
                return res.status(400).json({ message: '이 태그는 이미 해당 포인트에 연결되어 있습니다.' });
            }
            // 있으면 연결
            divePoint.tags.push(diveTag);
        } else {
            // 새 태그 생성 (PENDING 상태)
            const newTag = new DiveTagMst();
            newTag.name = tagName;
            newTag.tagtype = 'user_defined';
            newTag.tagStatus = RequestStatus.PENDING;
            await diveTagMstRepo.save(newTag);
            divePoint.tags.push(newTag);
            diveTag = newTag;
        }

        await divePointRepo.save(divePoint);

        res.status(200).json({
            message: diveTag.tagStatus === RequestStatus.APPROVED
                ? '태그가 추가되었습니다.'
                : '태그 추가 요청이 접수되었습니다. 관리자 승인 후 표시됩니다.',
            tag: diveTag
        });

    } catch (error: any) {
        console.error('Error requesting tag addition:', error);
        res.status(500).json({ message: '태그 추가 요청에 실패했습니다.', error: error.message });
    }
});

router.get('/', async (req: Request, res: Response) => { // 승인, 미승인 필터 추가
    try {
        const { tagStatus } = req.query;

        const diveTagMstRepo = AppDataSource.getRepository(DiveTagMst);
        const whereClause: any = {};
        if (tagStatus) {

            const isValidStatus = Object.values(RequestStatus).includes(tagStatus as RequestStatus);

            if (isValidStatus) {

                whereClause.tagStatus = tagStatus as RequestStatus;
            } else { // status값이 enum에 해당하지 않는 경우
                return res.status(400).json({ message: '유효하지 않은 status 값입니다.' });
            }
        }

        const diveTags = await diveTagMstRepo.find({
            where: whereClause
        });

        res.json(diveTags);

    } catch (error: any) {
        console.error('조회 오류:', error);
        res.status(500).json({ message: '태그 조회 중 오류 발생', error: error.message });
    }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
    try {

        /* 1. 태그 상태 변경하기 */
        const tagId = parseInt(req.params.id, 10);
        const { tagStatus } = req.body

        if (isNaN(tagId)) {
            return res.status(400).json({ message: '유효하지 않은 태그 정보입니다."' });
        }

        const diveTagMstRepo = AppDataSource.getRepository(DiveTagMst);
        const diveTag = await diveTagMstRepo.findOneBy({ id: tagId });

        if (!diveTag) {
            return res.status(400).json({ message: '해당 태그를 찾을 수 없습니다.' });
        }

        diveTag.tagStatus = tagStatus;
        await diveTagMstRepo.save(diveTag);

        res.status(200).json({ message: '성공적으로 변경 되었습니다.', DiveTagMst: diveTag });


    } catch (error: any) {
        console.error('태그 상태 변경 중 오류', error);
        res.status(500).json({ message: '태그 상태 변경 중 api 오류발생', error: error.message });
    }

});


export default router;
