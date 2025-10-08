import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link 임포트
import styles from './BuddyBoard.module.css';
import PostEditor from '../PostEditor/PostEditor';
import { fetchBoardList, fetchCategoriesByParent, createPost } from '../../utils/api';

interface Post {
  id: number;
  category: { id: number; name: string; };
  title: string;
  author: string;
  views: number;
  likes: number;
}

const BuddyBoard: React.FC = () => {

  const [viewMode, setViewMode] = useState<'list' | 'write'>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const categoriesResult = await fetchCategoriesByParent('버디');
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      const boardListResult = await fetchBoardList();
      if (boardListResult.success) {
        setPosts(boardListResult.data);
      }
    };
    loadData();
  }, []);

  const handlePostSubmit = async (newPostData: { categoryId: number; title: string; content: string; }) => {
    const postWithAuthor = { ...newPostData, author: '현재사용자' }; // Add author before sending
    const result = await createPost(postWithAuthor);

    if (result.success) {
        const boardListResult = await fetchBoardList();
        if (boardListResult.success) {
            // No need to mock author anymore if backend provides it
            setPosts(boardListResult.data);
        }
        setViewMode('list');
    } else {
        alert(`게시글 등록에 실패했습니다: ${result.message}`);
    }
  };

  if (viewMode === 'write') {
    return <PostEditor onSubmit={handlePostSubmit} onCancel={() => setViewMode('list')} categories={categories} />;
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardHeader}>
        <h1 className={styles.boardTitle}>버디구하기</h1>
        <button onClick={() => setViewMode('write')} className={styles.writeButton}>글쓰기</button>
      </div>
      <table className={styles.boardTable}>
        <thead>
          <tr>
            <th>게시글번호</th>
            <th>모집유형</th>
            <th>게시글제목</th>
            <th>작성자</th>
            <th>조회수</th>
            <th>추천수</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.category.name}</td>
              <td className={styles.titleCell}>
                <Link to={`/board/${post.id}`}>{post.title}</Link>
              </td>
              <td>{post.author}</td>
              <td>{post.views}</td>
              <td>{post.likes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.searchContainer}>
        <select className={styles.searchSelect}>
          <option value="title">게시글제목</option>
          <option value="author">작성자</option>
          <option value="type">모집유형</option>
        </select>
        <input type="text" className={styles.searchInput} placeholder="검색어를 입력하세요" />
        <button className={styles.searchButton}>검색</button>
      </div>
    </div>
  );
};

export default BuddyBoard;
