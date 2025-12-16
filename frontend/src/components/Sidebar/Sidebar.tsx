import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../MainLayout/MainLayout.module.css'; // Reusing MainLayout's styles for now

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    activeMenuItem: string | null;
    onMenuItemClick: (menuType: string) => void;
    userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, activeMenuItem, onMenuItemClick, userRole }) => {
    return (
        <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                <button className={styles.toggleBtn} onClick={toggleSidebar}>
                    <span id="toggle-icon">{isCollapsed ? '☰' : '✕'}</span>
                    <span className={styles.menuText} style={{ marginLeft: '10px' }}>메뉴</span>
                </button>
            </div>
            <ul className={styles.menuList}>
                <Link to="/" className={styles.menuLink}>
                    <li
                        className={`${styles.menuItem} ${activeMenuItem === 'realtime' ? styles.active : ''}`}
                        onClick={() => onMenuItemClick('realtime')}
                        data-menu="realtime"
                    >
                        <span className={styles.menuIcon}>🌊</span>
                        <span className={styles.menuText}>다이빙 지도</span>
                    </li>
                </Link>
                <Link to="/board" className={styles.menuLink}>
                    <li
                        className={`${styles.menuItem} ${activeMenuItem === 'buddy' ? styles.active : ''}`}
                        onClick={() => onMenuItemClick('buddy')}
                        data-menu="buddy"
                    >
                        <span className={styles.menuIcon}>🕵️‍♀️</span>
                        <span className={styles.menuText}>버디구해요</span>
                    </li>
                </Link>
                {userRole === 'MASTER' && (
                    <Link to="/settings" className={styles.menuLink}>
                        <li
                            className={`${styles.menuItem} ${activeMenuItem === 'settings' ? styles.active : ''}`}
                            onClick={() => onMenuItemClick('settings')}
                            data-menu="settings"
                        >
                            <span className={styles.menuIcon}>⚙️</span>
                            <span className={styles.menuText}>설정</span>
                        </li>
                    </Link>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
