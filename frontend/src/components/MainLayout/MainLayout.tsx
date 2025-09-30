import React, { useState, useEffect } from 'react';
import styles from './MainLayout.module.css';
import Sidebar from '../Sidebar/Sidebar';
import MapComponent from '../MapComponent/MapComponent';
import { fetchSeaConditionData } from '../../utils/api'; 

interface MainLayoutProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {

    //사이드바 토글
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
    const [seaConditionData, setSeaConditionData] = useState<any>(null);

    /*포인트 정보 관련*/
    const [infoPanelLoading, setInfoPanelLoading] = useState(false);
    const [infoPanelError, setInfoPanelError] = useState<string | null>(null);

    const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAOMAP_API_KEY

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleMenuItemClick = async (menuType: string) => {

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
            />

            {/* 상단 */}
            <div className={styles.mainContent}>
                {children || (
                    <>
                        <div className={styles.contentHeader}>
                            <h1>아맞다 바다날씨</h1>
                            <p>실시간 해양 정보를 확인하고 관리할 수 있습니다.</p>
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