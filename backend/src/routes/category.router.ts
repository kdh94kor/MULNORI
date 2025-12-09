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
        const categoryRepo = AppDataSource.getTreeRepository(BoardCategoryMaster);
        const categories = await categoryRepo.findTrees();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "카테고리 불러오기 오류", error });
    }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 카테고리 생성
 *     tags: [Category]
 *     description: 새로운 카테고리를 생성합니다. parentId가 있으면 하위 카테고리로 생성됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: number
 *     responses:
 *       '200':
 *         description: 성공. 생성된 카테고리를 반환합니다.
 *       '500':
 *         description: 서버 오류.
 */
router.post('/categories', async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

        const category = new BoardCategoryMaster();
        category.name = name;

        if (parentId) {
            const parent = await categoryRepo.findOne({ where: { id: parentId } });
            if (parent) {
                category.parent = parent;
            }
        }

        const result = await categoryRepo.save(category);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "카테고리 생성 오류", error });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: 카테고리 수정
 *     tags: [Category]
 *     description: 카테고리 이름이나 부모를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: 성공. 수정된 카테고리를 반환합니다.
 *       '404':
 *         description: 카테고리를 찾을 수 없음.
 *       '500':
 *         description: 서버 오류.
 */
router.put('/categories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, parentId } = req.body;
        const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

        const category = await categoryRepo.findOne({ where: { id }, relations: ['parent'] });
        if (!category) {
            return res.status(404).send({ message: "카테고리를 찾을 수 없습니다." });
        }

        if (name) category.name = name;

        if (parentId !== undefined) {
            if (parentId === null) {
                category.parent = null as any; // Root category
            } else {
                const parent = await categoryRepo.findOne({ where: { id: parentId } });
                if (parent) {
                    category.parent = parent;
                }
            }
        }

        const result = await categoryRepo.save(category);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "카테고리 수정 오류", error });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제
 *     tags: [Category]
 *     description: 카테고리를 삭제합니다. 하위 카테고리가 있는 경우 함께 삭제될 수 있습니다(설정에 따라 다름).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: 성공.
 *       '404':
 *         description: 카테고리를 찾을 수 없음.
 *       '500':
 *         description: 서버 오류.
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

        const category = await categoryRepo.findOne({ where: { id } });
        if (!category) {
            return res.status(404).send({ message: "카테고리를 찾을 수 없습니다." });
        }

        await categoryRepo.remove(category);
        res.json({ message: "삭제되었습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "카테고리 삭제 오류", error });
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
