import type { User } from '@/models/User';
import type { UserRepository } from '@/services/database/userRepository';
import { LocalAuthService } from '@/services/auth/localAuthService';

jest.mock('@/services/auth/password', () => ({ hashPassword: jest.fn(async (value: string) => `hash:${value}`), verifyPassword: jest.fn(async (value: string, hash: string) => hash === `hash:${value}`) }));

const user: User = { id: 'user-a', email: 'a@example.com', displayName: 'a', avatarUri: null, authProvider: 'local', providerUserId: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

function setup() {
  const users = {
    findByEmail: jest.fn(async () => null as { user: User; passwordHash: string } | null),
    create: jest.fn(async () => user),
    saveSession: jest.fn(async () => undefined),
    restoreSession: jest.fn(async () => user),
    updateProfile: jest.fn(async () => user),
    passwordHash: jest.fn(async () => 'hash:old-password'),
    updatePassword: jest.fn(async () => undefined),
  };
  return { service: new LocalAuthService(users as unknown as UserRepository), users };
}

it('registers a normalized email, hashes the password, and persists a session', async () => {
  const { service, users } = setup();
  expect(await service.register(' A@Example.com ', 'new-password', 'new-password')).toEqual(user);
  expect(users.create).toHaveBeenCalledWith('a@example.com', 'hash:new-password');
  expect(users.saveSession).toHaveBeenCalledWith('user-a');
});

it('rejects duplicate email and password mismatch', async () => {
  const { service, users } = setup();
  users.findByEmail.mockResolvedValue({ user, passwordHash: 'hash:old-password' });
  await expect(service.register('a@example.com', 'new-password', 'new-password')).rejects.toMatchObject({ code: 'duplicateEmail' });
  await expect(service.register('b@example.com', 'new-password', 'wrong')).rejects.toMatchObject({ code: 'passwordMismatch' });
});

it('logs in, restores sessions, and logs out without deleting user data', async () => {
  const { service, users } = setup();
  users.findByEmail.mockResolvedValue({ user, passwordHash: 'hash:old-password' });
  await expect(service.login('a@example.com', 'wrong-pass', true)).rejects.toMatchObject({ code: 'invalidCredentials' });
  await service.login('a@example.com', 'old-password', true);
  expect(users.saveSession).toHaveBeenCalledWith('user-a');
  expect(await service.restore()).toEqual(user);
  await service.logout();
  expect(users.saveSession).toHaveBeenLastCalledWith(null);
});

it('verifies current password before changing it', async () => {
  const { service, users } = setup();
  await expect(service.changePassword('user-a', 'incorrect', 'new-password', 'new-password')).rejects.toMatchObject({ code: 'incorrectCurrentPassword' });
  expect(users.updatePassword).not.toHaveBeenCalled();
  await service.changePassword('user-a', 'old-password', 'new-password', 'new-password');
  expect(users.updatePassword).toHaveBeenCalledWith('user-a', 'hash:new-password');
});
