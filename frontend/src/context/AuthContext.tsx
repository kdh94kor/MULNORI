import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// DB에서 가져온 사용자 정보 타입
interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  gender?: string;
  contact?: string;
  location?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  dbUser: DbUser | null; // DB 사용자 정보 추가
  loading: boolean;
  dbUserLoading: boolean; // DB 사용자 정보 로딩 상태
  signOut: () => Promise<void>;
  refreshDbUser: () => Promise<void>; // DB 사용자 정보 새로고침
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbUserLoading, setDbUserLoading] = useState(true); // 초기값 true로 변경

  // DB 사용자 정보 조회 함수
  const fetchDbUser = async (userId: string) => {
    setDbUserLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
      } else {
        console.error('DB 사용자 정보 조회 실패:', response.status);
        setDbUser(null);
      }
    } catch (error) {
      console.error('DB 사용자 정보 조회 오류:', error);
      setDbUser(null);
    } finally {
      setDbUserLoading(false);
    }
  };

  // DB 사용자 정보 새로고침
  const refreshDbUser = async () => {
    if (user?.id) {
      await fetchDbUser(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // 세션이 있으면 DB 사용자 정보도 조회
      if (session?.user?.id) {
        fetchDbUser(session.user.id);
      } else {
        // 세션이 없으면 dbUserLoading도 false로
        setDbUserLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // 인증 상태 변경 시 DB 사용자 정보도 업데이트
      if (session?.user?.id) {
        fetchDbUser(session.user.id);
      } else {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 상태는 초기화
      console.error('로그아웃 API 오류:', error);
    }
    // API 성공/실패 관계없이 로컬 상태 초기화
    setSession(null);
    setUser(null);
    setDbUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, dbUser, loading, dbUserLoading, signOut, refreshDbUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
