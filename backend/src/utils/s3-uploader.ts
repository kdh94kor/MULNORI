import AWS from 'aws-sdk';

// AWS S3 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

/**
 * 파일을 S3에 업로드하는 함수
 * @param file Multer를 통해 받은 파일 객체
 * @returns 업로드된 파일의 S3 URL
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('AWS S3 bucket name is not configured in environment variables.');
    }

    const params: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: `${Date.now().toString()}-${file.originalname}`, // 파일 이름 중복 방지
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // 업로드된 파일을 공개적으로 읽을 수 있도록 설정
    };

    try {
        const { Location } = await s3.upload(params).promise();
        console.log(`File uploaded successfully. ${Location}`);
        return Location;
    } catch (error) {
        console.error('S3 Upload Error: ', error);
        throw new Error('Failed to upload file to S3.');
    }
};
