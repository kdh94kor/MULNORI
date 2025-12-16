import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 클라이언트 - 지연 초기화
let supabase: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided in environment variables.');
        }

        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
};

/**
 * 파일을 Supabase Storage에 업로드하는 함수
 * @param file Multer를 통해 받은 파일 객체
 * @returns 업로드된 파일의 Public URL
 */
export const uploadToSupabase = async (file: Express.Multer.File): Promise<string> => {

    const bucketName = process.env.SUPABASE_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('Supabase 버킷명 없음');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
        const client = getSupabaseClient();
        const { data, error } = await client
            .storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data: publicUrlData } = client
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log(`업로드 성공! ${publicUrlData.publicUrl}`);
        return publicUrlData.publicUrl;

    } catch (error) {
        console.error('Supabase 업로드 오류: ', error);
        throw new Error('Supabase 업로드 실패');
    }
};
