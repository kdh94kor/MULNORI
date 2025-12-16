import React, { useState, useEffect } from 'react';
import styles from './ApprovalDashboard.module.css';
import { fetchDivePointMst, fetchDiveTagMst } from '../../utils/api';
import type { components } from '../../types/api';
import Swal from 'sweetalert2';
import CategoryManagement from '../Settings/CategoryManagement';

type DivePointMst = components['schemas']['DivePointMst'];
type TagApproval = components['schemas']['TagApproval'];

const ApprovalDashboard: React.FC = () => {
  const [pointRequests, setPointRequests] = useState<DivePointMst[]>([]);
  const [tagRequests, setTagRequests] = useState<TagApproval[]>([]);

  useEffect(() => {
    const loadPendingRequests = async () => {
      // 승인대기만 불러오기 
      const divePointResult = await fetchDivePointMst('PENDING');
      if (divePointResult.success) {
        setPointRequests(divePointResult.data as DivePointMst[]);
      } else {
        console.error(divePointResult.message);
      }

      const tagResult = await fetchDiveTagMst('PENDING');
      if (tagResult.success) {
        setTagRequests(tagResult.data as TagApproval[]);
      } else {
        console.error(tagResult.message);
      }
    };
    loadPendingRequests();
  }, []);

  const pointHandleAction = async (id: number, action: 'approve' | 'reject' | 'pend') => {
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
      const response = await fetch(`/api/dive-points/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pointStatus: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update pointStatus');
      }

      setPointRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      Swal.fire({ title: '다이빙 가보자고', text: `${id}포인트를 ${korStatus}(으)로 변경하였습니다.`, icon: 'success' });

    } catch (error: any) {
      console.error('Error updating dive point status:', error);
      Swal.fire({ title: '다이빙 가보자고', text: `상태 변경 실패: ${error.message}`, icon: 'error' });
    }
  };

  const tagsHandleAction = async (id: number, action: 'approve' | 'reject' | 'pend') => {
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
      const response = await fetch(`/api/tags/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagStatus: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tagStatus');
      }

      setTagRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      Swal.fire({ title: '다이빙 가보자고', text: `${id}태그를 ${korStatus}(으)로 변경하였습니다.`, icon: 'success' });

    } catch (error: any) {
      console.error('Error updating tags status:', error);
      Swal.fire({ title: '다이빙 가보자고', text: `상태 변경 실패: ${error.message}`, icon: 'error' });
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>관리자 승인 대시보드</h1>

      <h2 className={styles.subtitle}>다이빙 포인트 승인 요청</h2>
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
          {pointRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.pointName}</td>
              <td>{req.lat}</td>
              <td>{req.lot}</td>
              <td>
                {(() => {
                  const tags = req.tags as any;
                  if (!tags) return 'N/A';
                  if (typeof tags === 'string') return tags;
                  if (Array.isArray(tags)) return tags.map((t: any) => t.name || t).join(', ');
                  return 'N/A';
                })()}
              </td>
              <td>
                <span className={`${styles.status} ${styles[req.pointStatus?.toLowerCase() || '']}`}>
                  {req.pointStatus}
                </span>
              </td>
              <td>
                {req.pointStatus === 'PENDING' && (
                  <div className={styles.actions}>
                    <button onClick={() => pointHandleAction(req.id, 'approve')} className={`${styles.actionBtn} ${styles.approve}`}>승인</button>
                    <button onClick={() => pointHandleAction(req.id, 'pend')} className={`${styles.actionBtn} ${styles.pend}`}>보류</button>
                    <button onClick={() => pointHandleAction(req.id, 'reject')} className={`${styles.actionBtn} ${styles.reject}`}>거절</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className={styles.subtitle}>태그 승인 요청</h2>
      <table className={styles.requestTable}>
        <thead>
          <tr>
            <th>요청 ID</th>
            <th>태그 이름</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {tagRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{(req as any).name || req.tagName || 'N/A'}</td>
              <td>
                <span className={`${styles.status} ${styles[req.tagStatus?.toLowerCase() || '']}`}>
                  {req.tagStatus}
                </span>
              </td>
              <td>
                {req.tagStatus === 'PENDING' && (
                  <div className={styles.actions}>
                    <button onClick={() => tagsHandleAction(req.id, 'approve')} className={`${styles.actionBtn} ${styles.approve}`}>승인</button>
                    <button onClick={() => tagsHandleAction(req.id, 'pend')} className={`${styles.actionBtn} ${styles.pend}`}>보류</button>
                    <button onClick={() => tagsHandleAction(req.id, 'reject')} className={`${styles.actionBtn} ${styles.reject}`}>거절</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className={styles.section}>
        <CategoryManagement />
      </section>
    </div>
  );
};

export default ApprovalDashboard;
