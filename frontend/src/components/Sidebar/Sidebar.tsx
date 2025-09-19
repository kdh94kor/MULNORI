import React from 'react';
import styles from '../MainLayout/MainLayout.module.css'; // Reusing MainLayout's styles for now

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    activeMenuItem: string | null;
    onMenuItemClick: (menuType: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, activeMenuItem, onMenuItemClick }) => {
    return (
        <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                <button className={styles.toggleBtn} onClick={toggleSidebar}>
                    <span id="toggle-icon">{isCollapsed ? '☰' : '✕'}</span>
                    <span className={styles.menuText} style={{ marginLeft: '10px' }}>메뉴</span>
                </button>
            </div>
            <ul className={styles.menuList}>
                <li
                    className={`${styles.menuItem} ${activeMenuItem === 'realtime' ? styles.active : ''}`}
                    onClick={() => onMenuItemClick('realtime')}
                    data-menu="realtime"
                >
                    <span className={styles.menuIcon}>🌊</span>
                    <span className={styles.menuText}>실시간 바다 상황</span>
                </li>
                <li
                    className={`${styles.menuItem} ${activeMenuItem === 'settings' ? styles.active : ''}`}
                    onClick={() => onMenuItemClick('settings')}
                    data-menu="settings"
                >
                    <span className={styles.menuIcon}>⚙️</span>
                    <span className={styles.menuText}>설정</span>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;