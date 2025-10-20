import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import BuddyBoard from './components/BuddyBoard/BuddyBoard';
import PostDetail from './components/PostDetail/PostDetail'; // PostDetail 임포트
import ImageUploader from './components/ImageUploader/ImageUploader'; // ImageUploader 임포트
import ApprovalDashboard from './components/ApprovalDashboard/ApprovalDashboard';

function App() {

  const handleImageUpload = (imageUrl: string) => {
    console.log('Uploaded Image URL:', imageUrl);
    alert(`이미지 업로드 성공! URL: ${imageUrl}`);
  };

  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/board" element={<MainLayout><BuddyBoard /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><PostDetail /></MainLayout>} /> {/* 상세 페이지 라우트 추가 */}
      {/* 이미지 업로더 테스트 */}
      <Route 
        path="/upload-test" 
        element={
          <MainLayout>
            <div style={{ padding: '20px' }}>
              <h2>이미지 업로더 테스트</h2>
              <ImageUploader onUploadSuccess={handleImageUpload} />
            </div>
          </MainLayout>
        } 
      />

      <Route path="/settings" element={<MainLayout><ApprovalDashboard /></MainLayout>} />
    </Routes>
  );
}

export default App;