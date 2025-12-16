import React, { useState } from 'react';
import styles from './MainLayout.module.css';
import Sidebar from '../Sidebar/Sidebar';
import MapComponent from '../MapComponent/MapComponent';
import { fetchSeaConditionData } from '../../utils/api'; 
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, dbUser, signOut } = useAuth();

    //사이드바 토글
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
    const [seaConditionData, setSeaConditionData] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    /*포인트 정보 관련*/
    const [infoPanelLoading, setInfoPanelLoading] = useState(false);
    const [infoPanelError, setInfoPanelError] = useState<string | null>(null);

    const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAOMAP_API_KEY

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleMenuItemClick = async (menuType: string) => {
        if (activeMenuItem === menuType) {
            setRefreshKey(prevKey => prevKey + 1);
        }

        setActiveMenuItem(menuType);
        setInfoPanelLoading(true);
        setInfoPanelError(null);
        setSeaConditionData(null); 

        if (menuType === 'realtime') {
            const result = await fetchSeaConditionData(menuType);
            if (result.success) {
                setSeaConditionData(result.data);
            } else {
                setInfoPanelError(result.message);
            }
        } else {
            setSeaConditionData({ message: '설정 메뉴입니다.' });
        }
        setInfoPanelLoading(false);
    };

    return (
        <div className={styles.containerFluid}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                activeMenuItem={activeMenuItem}
                onMenuItemClick={handleMenuItemClick}
                userRole={dbUser?.role || ''}
            />

            {/* 상단 */}
            <div className={styles.mainContent}>
                {children ? (
                    React.cloneElement(children as React.ReactElement, { key: refreshKey })
                ) : (
                    <>
                        <div className={styles.contentHeader}>
                            <div>
                                <h1>다이빙 가보자고</h1>
                                <p>🙏🙏다이빙 포인트를 공유해주세요🙏🙏</p>
                            </div>
                            <div className={styles.authButtons}>
                                {user ? (
                                    <>
                                        <span style={{ marginRight: '10px', alignSelf: 'center', color: '#333' }}>{user.email}님</span>
                                        <button onClick={signOut} className={`${styles.authBtn} ${styles.loginBtn}`}>로그아웃</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className={`${styles.authBtn} ${styles.loginBtn}`}>로그인</Link>
                                        <Link to="/signup" className={`${styles.authBtn} ${styles.signupBtn}`}>회원가입</Link>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* 카카오 맵 지도 영역 */}
                        <MapComponent
                            kakaoMapKey={KAKAO_MAP_KEY}
                            seaConditionData={seaConditionData}
                            infoPanelLoading={infoPanelLoading}
                            infoPanelError={infoPanelError}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default MainLayout;