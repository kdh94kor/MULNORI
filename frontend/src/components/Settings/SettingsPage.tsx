import React from 'react';
import ApprovalDashboard from '../ApprovalDashboard/ApprovalDashboard';
import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  return (
    <div className={styles.settingsContainer}>
      <ApprovalDashboard />
    </div>
  );
};

export default SettingsPage;
