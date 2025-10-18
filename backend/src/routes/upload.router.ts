import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { uploadToS3 } from '../utils/s3-uploader';

const router: Router = express.Router();

// Multer 설정: 메모리 스토리지를 사용하여 파일을 버퍼로 받음
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @route   POST /api/upload/image
 * @desc    이미지를 S3에 업로드
 * @access  Public
 */
router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    try {
        const imageUrl = await uploadToS3(req.file);
        return res.status(200).json({ imageUrl });
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
        }
        return res.status(500).json({ message: '알 수 없는 서버 오류가 발생했습니다.' });
    }
});

export default router;
