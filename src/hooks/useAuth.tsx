import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { User } from '@/models/User';
import { UserRepository } from '@/services/database/userRepository';
import { LocalAuthService } from '@/services/auth/localAuthService';

type AuthContextValue = {
  currentUser: User | null; isAuthenticated: boolean; isLoading: boolean;
  register: (email: string, password: string, confirmation: string) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatarUri: string | null) => Promise<void>;
  changePassword: (current: string, next: string, confirmation: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const service = useMemo(() => new LocalAuthService(new UserRepository(db)), [db]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void service.restore().then((user) => { if (active) setCurrentUser(user); })
      .catch((cause: unknown) => { if (__DEV__) console.error('Session restore failed', cause); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [service]);

  const register = useCallback(async (email: string, password: string, confirmation: string) => setCurrentUser(await service.register(email, password, confirmation)), [service]);
  const login = useCallback(async (email: string, password: string, remember: boolean) => setCurrentUser(await service.login(email, password, remember)), [service]);
  const logout = useCallback(async () => { await service.logout(); setCurrentUser(null); }, [service]);
  const updateProfile = useCallback(async (name: string, avatarUri: string | null) => {
    if (!currentUser) throw new Error('Authentication required');
    setCurrentUser(await service.updateProfile(currentUser.id, name, avatarUri));
  }, [currentUser, service]);
  const changePassword = useCallback(async (current: string, next: string, confirmation: string) => {
    if (!currentUser) throw new Error('Authentication required');
    await service.changePassword(currentUser.id, current, next, confirmation);
  }, [currentUser, service]);

  return <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, isLoading, register, login, logout, updateProfile, changePassword }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
