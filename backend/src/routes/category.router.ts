import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { BoardCategoryMaster } from '../entity/BoardCategoryMaster';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 모든 게시판 카테고리(계층구조) 조회
 *     tags: [Category]
 *     description: BoardCategoryMaster에 저장된 모든 카테고리를 계층 구조(트리) 형태로 조회합니다.
 *     responses:
 *       '200':
 *         description: 성공. 카테고리 트리 배열을 반환합니다.
 *       '500':
 *         description: 서버 오류.
 */
router.get('/categories', async (req, res) => {
    try {
        const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);
        const categories = await categoryRepo.find();
        res.json(categories);
    } catch (error) {
        res.status(500).send({ message: "카테고리 불러오기 오류", error });
    }
});


/**
 * @swagger
 * /categories/children/{parentName}:
 *   get:
 *     summary: 특정 상위 카테고리에 속한 하위 카테고리 목록 조회
 *     tags: [Category]
 *     description: 주어진 부모 카테고리 이름에 해당하는 모든 하위 카테고리를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: parentName
 *         required: true
 *         schema:
 *           type: string
 *         description: 하위 카테고리를 조회할 부모 카테고리의 이름
 *     responses:
 *       '200':
 *         description: 성공. 하위 카테고리 객체 배열을 반환합니다.
 *       '404':
 *         description: 상위 카테고리를 찾을 수 없음.
 *       '500':
 *         description: 서버 오류.
 */
router.get('/categories/children/:parentName', async (req, res) => {
    try {
        const { parentName } = req.params;
        const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

        const parentCategory = await categoryRepo.findOne({ where: { name: parentName } });

        if (!parentCategory) {
            return res.status(404).send({ message: "상위 카테고리를 찾을 수 없습니다." });
        }

        const childCategories = await categoryRepo.find({ where: { parent: { id: parentCategory.id } } });

        res.json(childCategories);
    } catch (error) {
        res.status(500).send({ message: "하위 카테고리 불러오기 오류", error });
    }
});

export default router;
