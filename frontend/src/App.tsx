import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
// import BuddyBoard from './components/BuddyBoard/BuddyBoard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      {/* <Route path="/board" element={<MainLayout><BuddyBoard /></MainLayout>} /> */}
    </Routes>
  );
}

export default App;