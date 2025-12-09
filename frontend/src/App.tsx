import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import BuddyBoard from './components/BuddyBoard/BuddyBoard';
import PostDetail from './components/PostDetail/PostDetail';
import ImageUploader from './components/ImageUploader/ImageUploader';
import SettingsPage from './components/Settings/SettingsPage';

function App() {

  const handleImageUpload = (imageUrl: string) => {
    console.log('Uploaded Image URL:', imageUrl);
    alert(`이미지 업로드 성공! URL: ${imageUrl}`);
  };

  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/board" element={<MainLayout><BuddyBoard /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><PostDetail /></MainLayout>} />
      
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

      <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
    </Routes>
  );
}

export default App;