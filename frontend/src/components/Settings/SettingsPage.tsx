import React from 'react';
import ApprovalDashboard from '../ApprovalDashboard/ApprovalDashboard';
import CategoryManagement from './CategoryManagement';

const SettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>설정</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <CategoryManagement />
      </section>

      <section>
        <ApprovalDashboard />
      </section>
    </div>
  );
};

export default SettingsPage;
