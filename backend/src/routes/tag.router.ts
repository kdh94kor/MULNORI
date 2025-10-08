import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { TagApproval } from '../entity/TagApproval';
import { DivePointMst } from '../entity/DivePointMst';
import { TagDeletionRequest } from '../entity/TagDeletionRequest';

const router = Router();

router.post('/request', async (req: Request, res: Response) => {
    try {
        const { divePointId, tagName } = req.body;

        if (!divePointId || !tagName) {
            return res.status(400).json({ message: '다이빙포인트 ID와 태그 이름은 필수 항목입니다.' });
        }

        // Optional: Check if the DivePointMst actually exists
        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointRepo.findOneBy({ id: divePointId });
        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        // Optional: Check if the tag already exists on the point
        const existingTags = divePoint.tags ? divePoint.tags.split(',').map(t => t.trim()) : [];
        if (existingTags.includes(tagName)) {
            return res.status(409).json({ message: '이미 존재하는 태그입니다.' });
        }

        // Optional: Check if there is already a pending request for this tag
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
        // status defaults to 'pending'

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

        // Check if the DivePointMst actually exists
        const divePointRepo = AppDataSource.getRepository(DivePointMst);
        const divePoint = await divePointRepo.findOneBy({ id: divePointId });
        if (!divePoint) {
            return res.status(404).json({ message: '해당 다이빙포인트를 찾을 수 없습니다.' });
        }

        // Check if the tag to be deleted actually exists on the point
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
            // If it exists, increment the count
            deletionRequest.requestCount += 1;
            await deletionRepo.save(deletionRequest);
        } else {
            // If it does not exist, create a new one
            deletionRequest = new TagDeletionRequest();
            deletionRequest.divePointId = divePointId;
            deletionRequest.tagName = tagName;
            // requestCount defaults to 1
            await deletionRepo.save(deletionRequest);
        }

        res.status(200).json({ message: '태그 삭제 요청이 접수되었습니다.' });

    } catch (error: any) {
        console.error('Error requesting tag deletion:', error);
        res.status(500).json({ message: '태그 삭제 요청에 실패했습니다.', error: error.message });
    }
});

export default router;
