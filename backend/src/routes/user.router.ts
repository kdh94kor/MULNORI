import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

const router = Router();

// 사용자 정보 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json(user);
    } catch (error) {
        console.error('유저 조회 실패: ', error);
        res.status(500).json({ message: '유저 조회 실패' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { id, email, name, gender, contact, location } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = userRepository.create({
            id,
            email,
            name,
            gender,
            contact,
            location
        });

        await userRepository.save(user);
        res.status(201).json(user);
    } catch (error) {
        console.error('유저 생성실패 : ', error);
        res.status(500).json({ message: '유저 생성실패' });
    }
});

export default router;
