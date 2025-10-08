import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContent } from '../../utils/api';
import styles from './PostDetail.module.css';

interface Post {
    id: number;
    category: { id: number; name: string; };
    title: string;
    author: string;
    content: string;
    views: number;
    likes: number;
}

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const loadPost = async () => {
                const result = await getContent(id);
                if (result.success) {
                    setPost(result.data);
                } else {
                    setError(result.message || '게시글을 불러오는데 실패했습니다.');
                }
            };
            loadPost();
        }
    }, [id]);

    if (error) {
        return <div className={styles.error}>에러: {error}</div>;
    }

    if (!post) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={styles.detailContainer}>
            <div className={styles.header}>
                <span className={styles.category}>[{post.category.name}]</span>
                <h1 className={styles.title}>{post.title}</h1>
                <div className={styles.meta}>
                    <span>작성자: {post.author}</span>
                    <span>조회수: {post.views}</span>
                </div>
            </div>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
            <div className={styles.actions}>
                <button className={styles.likeButton}>추천 {post.likes}</button>
                <Link to="/board" className={styles.listButton}>목록으로</Link>
            </div>
        </div>
    );
};

export default PostDetail;
