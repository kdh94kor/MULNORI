import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './SignUp.module.css';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('PRIVATE');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Supabase Auth 회원가입
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (data.user) {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: data.user.id,
                        email,
                        name,
                        gender,
                        contact,
                        location
                    })
                });
                
                if (!response.ok) {
                    throw new Error('사용자 정보 저장에 실패했습니다.');
                }

                Swal.fire({ title: '다이빙 가보자고', text: '회원가입 성공! 이메일을 확인해주세요.', icon: 'success' });
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>회원가입</h2>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSignUp}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>이메일</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@email.com"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>비밀번호</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="6자 이상 입력해주세요"
                            minLength={6}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>이름</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="홍길동"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>성별</label>
                        <select
                            className={styles.select}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="PRIVATE">비공개</option>
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>연락처</label>
                        <input
                            type="tel"
                            className={styles.input}
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="010-1234-5678"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>주활동지역</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 서울시"
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? '가입 중...' : '가입하기'}
                    </button>
                </form>
                <div className={styles.loginLink}>
                    이미 계정이 있으신가요? <Link to="/login" className={styles.link}>로그인</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
