import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { BoardCategoryMaster } from '../entity/BoardCategoryMaster';
import { Board } from '../entity/Board';

const router = Router();

router.get('/get_board_list_V1', async (req, res) => {
    try {
        const boardRepo = AppDataSource.getRepository(Board);
        const boardList = await boardRepo.find({ relations: ["category"] }); // Add relation

        res.json(boardList);
    } catch (error) {
        res.status(500).send({ message: "게시판 목록 불러오기 오류", error });
    }
});

router.post('/post_board_V1', async (req, res) => {
    // Add author to destructuring
    const { title, content, categoryId, author } = req.body;

    // Add author to validation
    if (!title || !content || !categoryId || !author) {
        return res.status(400).send({ message: "게시글 제목, 내용, 모집유형, 작성자가 모두 입력되어야 합니다." });
    }

    const boardRepo = AppDataSource.getRepository(Board);
    const categoryRepo = AppDataSource.getRepository(BoardCategoryMaster);

    try {

          // 사용자가 임의로 카테고리를 편집할 수 있어 카테고리마스터에 해당 유형이 있는지 확인
        const category = await categoryRepo.findOneBy({ id: categoryId });
        if (!category) {
            return res.status(404).send({ message: "선택한 카테고리는 존재하지 않습니다." });
        }

        const newBoard = new Board();
        newBoard.title = title;
        newBoard.content = content; // Add content
        newBoard.category = category;
        newBoard.author = author; // Add author
        newBoard.views = 0;
        newBoard.likes = 0;

        await boardRepo.save(newBoard);

        res.status(201).json(newBoard);

    } catch (error) {
        res.status(500).send({ message: "게시글 등록에 실패했습니다 ㅠㅠ", error });
    }
});

router.get('/get_board_content_V1/:id', async (req, res) => {

    try{
        const { id } = req.params;
        const boardRepo = AppDataSource.getRepository(Board);
        const boardContent = await boardRepo.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["category"]
        });

        if (!boardContent) {
            return res.status(404).send({ message: "게시글을 조회할 수 없습니다"});
        }

        boardContent.views = (boardContent.views || 0) + 1;
        await boardRepo.save(boardContent);

        res.json(boardContent);


    }catch (error) {

        res.status(500).send({ message: "게시글 조회에 실패했습니다 ㅜㅜ", error});

    }


});

export default router;
