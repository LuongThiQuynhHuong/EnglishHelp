export type AuthProvider = 'local' | 'google' | 'facebook' | 'server';

export type User = {
  id: string;
  email: string;
  displayName: string;
  avatarUri: string | null;
  authProvider: AuthProvider;
  providerUserId: string | null;
  createdAt: string;
  updatedAt: string;
};
