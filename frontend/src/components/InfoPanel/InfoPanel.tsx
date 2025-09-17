import React from 'react';
import styles from '../MainLayout/MainLayout.module.css';

interface InfoPanelProps {
    seaConditionData: any;
    loading: boolean;
    error: string | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ seaConditionData, loading, error }) => {
    const renderContent = () => {
        if (loading) {
            return <div className={styles.loading}>데이터를 불러오는 중...</div>;
        }
        if (error) {
            return <div className={styles.error}>서버 오류: {error}</div>;
        }
        if (!seaConditionData) {
            return <div className={styles.info}>표시할 데이터가 없습니다.</div>;
        }

        // Assuming seaConditionData has properties like temperature, waveHeight, etc.
        // This structure comes from the original displayMenuData function in Index.cshtml
        return (
            <>
                <h3>실시간 바다 상황</h3>
                <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>수온:</span>
                    <span className={styles.dataValue}>{seaConditionData.temperature}</span>
                </div>
                <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>파고:</span>
                    <span className={styles.dataValue}>{seaConditionData.waveHeight}</span>
                </div>
                <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>풍속:</span>
                    <span className={styles.dataValue}>{seaConditionData.windSpeed}</span>
                </div>
                <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>시정:</span>
                    <span className={styles.dataValue}>{seaConditionData.visibility}</span>
                </div>
            </>
        );
    };

    return (
        <div className={styles.infoPanel} id="infoPanel">
            {renderContent()}
        </div>
    );
};

export default InfoPanel;