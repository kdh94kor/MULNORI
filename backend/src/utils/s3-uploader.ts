import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';

// AWS S3 설정
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000,
        socketTimeout: 3000,
    }),
});

/**
 * 파일을 S3에 업로드하는 함수
 * @param file Multer를 통해 받은 파일 객체
 * @returns 업로드된 파일의 S3 URL
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('AWS S3 버킷 환경변수 설정 안됨');
    }

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: `${Date.now().toString()}-${file.originalname}`, // 파일 이름 중복 방지
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read', // 업로드된 파일을 공개적으로 읽을 수 있도록 설정
            },
        });

        const result = await upload.done();
        console.log(`업로드 성공. ${result.Location}`);
        return result.Location || '';
    } catch (error) {
        console.error('S3 업로드 오류: ', error);
        throw new Error('S3 업로드 실패');
    }
};
