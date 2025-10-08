import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import BuddyBoard from './components/BuddyBoard/BuddyBoard';
import PostDetail from './components/PostDetail/PostDetail'; // PostDetail 임포트

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/board" element={<MainLayout><BuddyBoard /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><PostDetail /></MainLayout>} /> {/* 상세 페이지 라우트 추가 */}
    </Routes>
  );
}

export default App;