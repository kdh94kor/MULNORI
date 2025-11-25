import React, { useState, useEffect } from 'react';
import styles from './CategoryManagement.module.css';

interface Category {
  id: number;
  name: string;
  children: Category[];
  parent?: Category;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingParentId, setAddingParentId] = useState<number | null>(null); // null means adding root
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('카테고리 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (parentId: number | null) => {
    if (!nameInput.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, parentId }),
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      await fetchCategories();
      setNameInput('');
      setAddingParentId(null);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('카테고리 생성 실패');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!nameInput.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput }),
      });

      if (!response.ok) throw new Error('Failed to update category');

      await fetchCategories();
      setNameInput('');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('카테고리 수정 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까? 하위 카테고리도 함께 삭제될 수 있습니다.')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('카테고리 삭제 실패');
    }
  };

  const startAdding = (parentId: number | null) => {
    setAddingParentId(parentId);
    setEditingId(null);
    setNameInput('');
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setAddingParentId(null);
    setNameInput(category.name);
  };

  const cancelAction = () => {
    setAddingParentId(null);
    setEditingId(null);
    setNameInput('');
  };

  const renderCategory = (category: Category) => {
    const isEditing = editingId === category.id;
    const isAddingChild = addingParentId === category.id;

    return (
      <div key={category.id} className={styles.categoryItem}>
        <div className={styles.categoryContent}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className={styles.input}
                autoFocus
              />
              <button onClick={() => handleUpdate(category.id)} className={styles.submitBtn}>저장</button>
              <button onClick={cancelAction} className={styles.cancelBtn}>취소</button>
            </>
          ) : (
            <>
              <span className={styles.categoryName}>{category.name}</span>
              <div className={styles.actions}>
                <button onClick={() => startAdding(category.id)} className={`${styles.actionBtn} ${styles.addBtn}`}>+ 하위 추가</button>
                <button onClick={() => startEditing(category)} className={`${styles.actionBtn} ${styles.editBtn}`}>수정</button>
                <button onClick={() => handleDelete(category.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>삭제</button>
              </div>
            </>
          )}
        </div>

        {isAddingChild && (
          <div className={styles.childrenContainer}>
            <div className={styles.formContainer}>
               <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="하위 카테고리 이름"
                className={styles.input}
                autoFocus
              />
              <button onClick={() => handleAdd(category.id)} className={styles.submitBtn}>추가</button>
              <button onClick={cancelAction} className={styles.cancelBtn}>취소</button>
            </div>
          </div>
        )}

        {category.children && category.children.length > 0 && (
          <div className={styles.childrenContainer}>
            {category.children.map(renderCategory)}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>카테고리 관리</h2>
      
      <div className={styles.actions} style={{ marginBottom: '20px' }}>
        <button onClick={() => startAdding(-1)} className={`${styles.actionBtn} ${styles.addBtn}`}>+ 최상위 카테고리 추가</button>
      </div>

      {addingParentId === -1 && (
          <div className={styles.formContainer}>
            <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="최상위 카테고리 이름"
            className={styles.input}
            autoFocus
            />
            <button onClick={() => handleAdd(null)} className={styles.submitBtn}>추가</button>
            <button onClick={cancelAction} className={styles.cancelBtn}>취소</button>
        </div>
      )}


      <div className={styles.treeContainer}>
        {categories.map(renderCategory)}
      </div>
    </div>
  );
};

export default CategoryManagement;
