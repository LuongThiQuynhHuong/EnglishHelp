import type { User } from '@/models/User';
import type { UserRepository } from '@/services/database/userRepository';
import { isHttpUrl } from '@/utils/vocabularyValidation';
import { hashPassword, verifyPassword } from './password';
import { AuthError, normalizeEmail, validateDisplayName, validateEmail, validatePassword } from './validation';

export interface AuthService {
  restore(): Promise<User | null>;
  register(email: string, password: string, confirmation: string): Promise<User>;
  login(email: string, password: string, remember: boolean): Promise<User>;
  logout(): Promise<void>;
  updateProfile(userId: string, displayName: string, avatarUri: string | null): Promise<User>;
  changePassword(userId: string, current: string, next: string, confirmation: string): Promise<void>;
}

export class LocalAuthService implements AuthService {
  constructor(private readonly users: UserRepository) {}
  restore() { return this.users.restoreSession(); }
  async register(rawEmail: string, password: string, confirmation: string): Promise<User> {
    const email = normalizeEmail(rawEmail);
    if (!email || !password || !confirmation) throw new AuthError('required');
    validateEmail(email); validatePassword(password);
    if (password !== confirmation) throw new AuthError('passwordMismatch');
    if (await this.users.findByEmail(email)) throw new AuthError('duplicateEmail');
    const hash = await hashPassword(password);
    let user: User;
    try { user = await this.users.create(email, hash); }
    catch (cause) { if (String(cause).includes('UNIQUE')) throw new AuthError('duplicateEmail'); throw cause; }
    await this.users.saveSession(user.id);
    return user;
  }
  async login(rawEmail: string, password: string, remember: boolean): Promise<User> {
    const email = normalizeEmail(rawEmail);
    if (!email || !password) throw new AuthError('required');
    validateEmail(email);
    const record = await this.users.findByEmail(email);
    if (!record || !await verifyPassword(password, record.passwordHash)) throw new AuthError('invalidCredentials');
    await this.users.saveSession(remember ? record.user.id : null);
    return record.user;
  }
  logout() { return this.users.saveSession(null); }
  async updateProfile(userId: string, rawName: string, rawAvatar: string | null): Promise<User> {
    const name = rawName.trim(); const avatar = rawAvatar?.trim() || null;
    validateDisplayName(name);
    if (avatar && !isHttpUrl(avatar)) throw new AuthError('invalidAvatarUrl');
    return this.users.updateProfile(userId, name, avatar);
  }
  async changePassword(userId: string, current: string, next: string, confirmation: string): Promise<void> {
    if (!current || !next || !confirmation) throw new AuthError('required');
    validatePassword(next);
    if (next !== confirmation) throw new AuthError('passwordMismatch');
    const hash = await this.users.passwordHash(userId);
    if (!hash || !await verifyPassword(current, hash)) throw new AuthError('incorrectCurrentPassword');
    await this.users.updatePassword(userId, await hashPassword(next));
  }
}
