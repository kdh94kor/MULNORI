import React, { useState, useEffect } from 'react';
import styles from './ApprovalDashboard.module.css';

// 테스트용 데이터 
const dummyRequests = [
  {
    id: 1,
    type: '포인트 추가 요청',
    content: '새로운 다이빙 포인트: 제주도 서귀포시',
    status: 'pending'
  },
  {
    id: 2,
    type: '태그 삭제 요청',
    content: '포인트 #123 - 태그 \'샤워장잇음\' 삭제 요청',
    status: 'pending'
  },
  {
    id: 3,
    type: '태그 추가 요청',
    content: '포인트 #45 - 태그 \'거북이\' 추가 요청',
    status: 'approved'
  },
];

const ApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState(dummyRequests);

  // TODO: API를 통해 실제 데이터를 가져오는 로직 추가
  // useEffect(() => {
  //   fetch('/api/admin/requests')
  //     .then(res => res.json())
  //     .then(data => setRequests(data));
  // }, []);

  const handleAction = (id: number, action: 'approve' | 'reject' | 'pend') => {
    console.log(`Request ${id} action: ${action}`);
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending' } : req
    ));
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>관리자 승인 대시보드</h1>
      <table className={styles.requestTable}>
        <thead>
          <tr>
            <th>요청 ID</th>
            <th>요청 항목</th>
            <th>요청 내용</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.type}</td>
              <td>{req.content}</td>
              <td>
                <span className={`${styles.status} ${styles[req.status]}`}>
                  {req.status}
                </span>
              </td>
              <td>
                {req.status === 'pending' && (
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
