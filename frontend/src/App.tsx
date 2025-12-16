import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import BuddyBoard from './components/BuddyBoard/BuddyBoard';
import PostDetail from './components/PostDetail/PostDetail';
import ImageUploader from './components/ImageUploader/ImageUploader';
import SettingsPage from './components/Settings/SettingsPage';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Swal from 'sweetalert2';

function App() {

  const handleImageUpload = (imageUrl: string) => {
    console.log('Uploaded Image URL:', imageUrl);
    Swal.fire({ title: '다이빙 가보자고', text: `이미지 업로드 성공! URL: ${imageUrl}`, icon: 'success' });
  };

  return (
    <AuthProvider>
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

        {/* Settings Route - MASTER role만 접근 가능 */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="MASTER">
              <MainLayout><SettingsPage /></MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Auth Routes */}
        <Route path="/signup" element={<MainLayout><SignUp /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;