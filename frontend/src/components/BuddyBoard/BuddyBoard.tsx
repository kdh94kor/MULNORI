import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BuddyBoard.module.css';
import PostEditor from '../PostEditor/PostEditor';
import { fetchBoardList, fetchCategoriesByParent, createPost } from '../../utils/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

interface Post {
  id: number;
  category: { id: number; name: string; };
  title: string;
  author: string;
  views: number;
  likes: number;
}

const BuddyBoard: React.FC = () => {
  const { user, dbUser, dbUserLoading } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'write'>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const categoriesResult = await fetchCategoriesByParent('버디구해요');
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
    const postWithAuthor = { ...newPostData, author: dbUser?.name || '' }; 
    const result = await createPost(postWithAuthor);

    if (result.success) {
        const boardListResult = await fetchBoardList();
        if (boardListResult.success) {
            setPosts(boardListResult.data);
        }
        setViewMode('list');
    } else {
        Swal.fire({ title: '다이빙 가보자고', text: `게시글 등록에 실패했습니다: ${result.message}`, icon: 'error' });
    }
  };

  const handleWriteClick = () => {
    if (!user) {
      Swal.fire({ title: '다이빙 가보자고', text: '글을 작성하려면 로그인이 필요합니다.', icon: 'warning' });
      return;
    }
    if (dbUserLoading) {
      Swal.fire({ title: '다이빙 가보자고', text: '사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', icon: 'info' });
      return;
    }
    if (!dbUser?.name) {
      Swal.fire({ title: '다이빙 가보자고', text: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.', icon: 'error' });
      return;
    }
    setViewMode('write');
  };

  if (viewMode === 'write') {
    return <PostEditor onSubmit={handlePostSubmit} onCancel={() => setViewMode('list')} categories={categories} />;
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardHeader}>
        <h1 className={styles.boardTitle}>버디구하기</h1>
        <button onClick={handleWriteClick} className={styles.writeButton}>글쓰기</button>
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
