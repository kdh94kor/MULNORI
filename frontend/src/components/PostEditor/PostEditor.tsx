import React, { useState, useEffect } from 'react';
import styles from './PostEditor.module.css';

// Props for the PostEditor component
interface PostEditorProps {
  onCancel: () => void;
  onSubmit: (post: { categoryId: number; title: string; content: string; }) => void;
  categories: { id: number; name: string; }[];
}

const PostEditor: React.FC<PostEditorProps> = ({ onCancel, onSubmit, categories }) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories]);

  const handleSubmit = () => {
    if (!categoryId) {
      alert('모집유형을 선택해주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    onSubmit({ categoryId: Number(categoryId), title, content });
  };

  return (
    <div className={styles.editorContainer}>
      <h2>새 글 작성</h2>
      <div className={styles.formGroup}>
        <label htmlFor="category">모집유형</label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="" disabled>카테고리를 선택하세요</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="title">제목</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={15}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={handleSubmit} className={styles.submitButton}>등록</button>
        <button onClick={onCancel} className={styles.cancelButton}>취소</button>
      </div>
    </div>
  );
};

export default PostEditor;
