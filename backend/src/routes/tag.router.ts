import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { DivePointMst } from '../entity/DivePointMst';
import { TagDeletionRequest } from '../entity/TagDeletionRequest';
import { DiveTagMst } from '../entity/DiveTagMst';
import { RequestStatus } from '../constants/request-status.enum';

const router = Router();


//태그 삭제요청 카운트
const DELETION_REQUEST_THRESHOLD = 5; 

router.post('/request', async (req: Request, res: Response) => {
    try {
        const { divePointId, tagName } = req.body;

        if (!divePointId || !tagName) {
            return res.status(400).json({ message: '다이빙포인트 ID와 태그 이름은 필수 항목입니다.' });
        }

        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointRepo.findOneBy({ id: divePointId });
        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        const existingTags = divePoint.tags ? divePoint.tags.split(',').map(t => t.trim()) : [];
        if (existingTags.includes(tagName)) {
            return res.status(409).json({ message: '이미 존재하는 태그입니다.' });
        }

        const tagApprovalRepo = AppDataSource.getRepository(TagApproval);
        const existingRequest = await tagApprovalRepo.findOne({
            where: {
                divePointId: divePointId,
                tagName: tagName,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(409).json({ message: '이미 승인 대기중인 태그입니다.' });
        }

        const newTagRequest = new TagApproval();
        newTagRequest.divePointId = divePointId;
        newTagRequest.tagName = tagName;

        await tagApprovalRepo.save(newTagRequest);

        res.status(201).json({ message: '태그 추가를 요청했습니다. 관리자 승인 후 표시됩니다.' });

    } catch (error: any) {
        console.error('Error requesting tag addition:', error);
        res.status(500).json({ message: '태그 추가 요청에 실패했습니다.', error: error.message });
    }
});


router.post('/request-deletion', async (req: Request, res: Response) => {
    try {
        const { divePointId, tagName } = req.body;

        if (!divePointId || !tagName) {
            return res.status(400).json({ message: '다이빙포인트 ID와 태그 이름은 필수 항목입니다.' });
        }

        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointRepo.findOne({
            where: { id: divePointId },
            relations: ["tags"], 
        });
        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        const existingTags = divePoint.tags ? divePoint.tags.split(',').map(t => t.trim()) : [];
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
            deletionRequest.requestCount += 1;
            await deletionRepo.save(deletionRequest);
        } else {
            deletionRequest = new TagDeletionRequest();
            deletionRequest.divePointId = divePointId;
            deletionRequest.tagName = tagName;
            await deletionRepo.save(deletionRequest);
        }

        // 태그 삭제 요청 체크 후 요청 접수 
        if (deletionRequest.requestCount >= DELETION_REQUEST_THRESHOLD) {
            deletionRequest.is_hidden = true;

            let tagsArray = divePoint.tags ? divePoint.tags.split(',').map(t => t.trim()) : [];
            tagsArray = tagsArray.filter(tag => tag !== tagName);
            divePoint.tags = tagsArray.join(',');

            await divePointRepo.save(divePoint);
            await deletionRepo.save(deletionRequest); 

            res.status(200).json({ message: '태그 삭제 요청이 접수되었으며, 요청 횟수 초과로 태그가 숨김 처리되었습니다.' });
        } else {
            res.status(200).json({ message: '태그 삭제 요청이 접수되었습니다.' });
        }

    } catch (error: any) {
        console.error('Error requesting tag deletion:', error);
        res.status(500).json({ message: '태그 삭제 요청에 실패했습니다.', error: error.message });
    }
});

router.get('/Get_TagMst_V2', async (req: Request, res: Response) => { // 승인, 미승인 필터 추가
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

router.patch('/Update_tagsMstStatus_V1/:id', async (req: Request, res: Response) => {
    try {

        /* 1. 태그 상태 변경하기 */
        const tagId = parseInt(req.params.id, 10);
        const {tagStatus} = req.body

        if (isNaN(tagId)){
            return res.status(400).json({message: '유효하지 않은 태그 정보입니다."'});
        }

        const diveTagMstRepo = AppDataSource.getRepository(DiveTagMst);
        const diveTag = await diveTagMstRepo.findOneBy({id: tagId});

        if (!diveTag){
            return res.status(400).json({message: '해당 태그를 찾을 수 없습니다.'});
        }

        diveTag.tagStatus = tagStatus;
        await diveTagMstRepo.save(diveTag);

        res.status(200).json({message: '성공적으로 변경 되었습니다.', DiveTagMst:diveTag});

        
    } catch(error: any) {
        console.error('태그 상태 변경 중 오류', error);
        res.status(500).json({message: '태그 상태 변경 중 api 오류발생', error: error.message});
    }

});


router.get('/admin/hidden-tags', async (req: Request, res: Response) => {
    try {
        const deletionRepo = AppDataSource.getRepository(TagDeletionRequest);
        const hiddenRequests = await deletionRepo.find({
            where: { is_hidden: true },
            relations: ['divePoint'] 
        });
        res.status(200).json(hiddenRequests);
    } catch (error: any) {
        console.error('Error fetching hidden tag deletion requests:', error);
        res.status(500).json({ message: '숨김 처리된 태그 삭제 요청을 가져오는 데 실패했습니다.', error: error.message });
    }
});

router.delete('/admin/tags/:requestId', async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params;
        const deletionRepo = AppDataSource.getRepository(TagDeletionRequest);

        const deletionRequest = await deletionRepo.findOne({
            where: { id: Number(requestId), is_hidden: true }
        });

        if (!deletionRequest) {
            return res.status(404).json({ message: '해당 숨김 처리된 태그 삭제 요청을 찾을 수 없습니다.' });
        }

        await deletionRepo.remove(deletionRequest);
        res.status(200).json({ message: '숨김 처리된 태그 삭제 요청이 영구적으로 삭제되었습니다.' });

    } catch (error: any) {
        console.error('Error permanently deleting tag deletion request:', error);
        res.status(500).json({ message: '숨김 처리된 태그 삭제 요청을 영구적으로 삭제하는 데 실패했습니다.', error: error.message });
    }
});

export default router;
