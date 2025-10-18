import React, { useState, useRef } from 'react';
import { uploadImage } from '../../utils/api';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
    onUploadSuccess: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('먼저 이미지를 선택해주세요.');
            return;
        }

        setUploading(true);
        setError(null);

        const result = await uploadImage(selectedFile);

        setUploading(false);

        if (result.success) {
            onUploadSuccess(result.data.imageUrl);
            // Reset after successful upload
            setSelectedFile(null);
            setPreview(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
            setError(result.message || '업로드에 실패했습니다.');
        }
    };

    return (
        <div className={styles.uploaderContainer}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className={styles.fileInput}
            />
            {preview && (
                <div className={styles.previewContainer}>
                    <img src={preview} alt="Image preview" className={styles.previewImage} />
                </div>
            )}
            <button onClick={handleUpload} disabled={uploading || !selectedFile}>
                {uploading ? '업로드 중...' : '이미지 업로드'}
            </button>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default ImageUploader;
