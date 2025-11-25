import React, { useState, useEffect } from 'react';
import styles from './ApprovalDashboard.module.css';
import { fetchDivePointMst } from '../../utils/api';
import type { components } from '../../types/api';

type DivePointMst = components['schemas']['DivePointMst'];

const ApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<DivePointMst[]>([]);

  useEffect(() => {
    const loadPendingRequests = async () => {
      // 승인대기만 불러오기 
      const result = await fetchDivePointMst('PENDING');
      if (result.success) {
        setRequests(result.data as DivePointMst[]);
      } else {
        console.error(result.message);
      }
    };
    loadPendingRequests();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'pend') => {
    let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    let korStatus = '';
    switch (action) {
      case 'approve':
        newStatus = 'APPROVED';
        korStatus = '승인';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        korStatus = '거절';
        break;
      case 'pend':
        newStatus = 'PENDING';
        korStatus = '보류';
        break;
      default:
        console.error('Invalid action:', action);
        return;
    }

    try {
      const response = await fetch(`/api/Update_DivePointMstStatus_V1/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      alert(`${id}포인트를 ${korStatus}(으)로 변경하였습니다.`);

    } catch (error: any) {
      console.error('Error updating dive point status:', error);
      alert(`상태 변경 실패: ${error.message}`);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>관리자 승인 대시보드</h1>
      <table className={styles.requestTable}>
        <thead>
          <tr>
            <th>요청 ID</th>
            <th>포인트 이름</th>
            <th>위도</th>
            <th>경도</th>
            <th>태그</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.pointName}</td>
              <td>{req.lat}</td>
              <td>{req.lot}</td>
              <td>{req.tags}</td>
              <td>
                <span className={`${styles.status} ${styles[req.pointStatus?.toLowerCase() || '']}`}>
                  {req.pointStatus}
                </span>
              </td>
              <td>
                {req.pointStatus === 'PENDING' && (
                  <div className={styles.actions}>
                    <button onClick={() => handleAction(req.id, 'approve')} className={`${styles.actionBtn} ${styles.approve}`}>승인</button>
                    <button onClick={() => handleAction(req.id, 'pend')} className={`${styles.actionBtn} ${styles.pend}`}>보류</button>
                    <button onClick={() => handleAction(req.id, 'reject')} className={`${styles.actionBtn} ${styles.reject}`}>거절</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalDashboard;
