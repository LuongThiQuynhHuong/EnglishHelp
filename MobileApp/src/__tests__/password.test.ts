import { hashPassword, verifyPassword } from '@/services/auth/password';

jest.mock('expo-crypto', () => ({ getRandomBytes: (count: number) => new Uint8Array(count).fill(7) }));

it('stores only a salted PBKDF2 hash and verifies without accepting a different password', async () => {
  const hash = await hashPassword('example-password');
  expect(hash).toMatch(/^pbkdf2-sha256\$210000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
  expect(hash).not.toContain('example-password');
  expect(await verifyPassword('example-password', hash)).toBe(true);
  expect(await verifyPassword('different-password', hash)).toBe(false);
});
