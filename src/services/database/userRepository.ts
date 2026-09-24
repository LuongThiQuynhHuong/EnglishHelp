import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { User } from '@/models/User';
import { DEFAULT_GROUP_SIZE } from '@/constants/defaults';
import { LEGACY_USER_ID } from './migrations';

type UserRow = { id: string; email: string; password_hash: string; display_name: string; avatar_uri: string | null; auth_provider: User['authProvider']; provider_user_id: string | null; created_at: string; updated_at: string };
function mapUser(row: UserRow): User {
  return { id: row.id, email: row.email, displayName: row.display_name, avatarUri: row.avatar_uri, authProvider: row.auth_provider, providerUserId: row.provider_user_id, createdAt: row.created_at, updatedAt: row.updated_at };
}

export class UserRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const row = await this.db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ? COLLATE NOCASE AND auth_provider = ?', email, 'local');
    return row ? { user: mapUser(row), passwordHash: row.password_hash } : null;
  }

  async get(id: string): Promise<User | null> {
    const row = await this.db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ? AND auth_provider != ?', id, 'legacy');
    return row ? mapUser(row) : null;
  }

  async restoreSession(): Promise<User | null> {
    const row = await this.db.getFirstAsync<UserRow>('SELECT users.* FROM auth_session JOIN users ON users.id = auth_session.user_id WHERE auth_session.id = 1');
    return row ? mapUser(row) : null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const displayName = email.split('@')[0];
    await this.db.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync('INSERT INTO users (id, email, password_hash, display_name, auth_provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', id, email, passwordHash, displayName, 'local', now, now);
      const count = await tx.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM users WHERE auth_provider != ?', 'legacy');
      if (count?.count === 1) {
        await tx.runAsync('UPDATE vocabularies SET user_id = ? WHERE user_id = ?', id, LEGACY_USER_ID);
        await tx.runAsync('INSERT INTO user_settings (user_id, language, review_group_size) SELECT ?, language, review_group_size FROM user_settings WHERE user_id = ?', id, LEGACY_USER_ID);
      } else {
        await tx.runAsync('INSERT INTO user_settings (user_id, language, review_group_size) VALUES (?, ?, ?)', id, 'en', DEFAULT_GROUP_SIZE);
      }
    });
    const user = await this.get(id);
    if (!user) throw new Error('Created user missing');
    return user;
  }

  async saveSession(userId: string | null): Promise<void> {
    await this.db.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync('DELETE FROM auth_session WHERE id = 1');
      if (userId) await tx.runAsync('INSERT INTO auth_session (id, user_id) VALUES (1, ?)', userId);
    });
  }

  async updateProfile(userId: string, displayName: string, avatarUri: string | null): Promise<User> {
    await this.db.runAsync('UPDATE users SET display_name = ?, avatar_uri = ?, updated_at = ? WHERE id = ?', displayName, avatarUri, new Date().toISOString(), userId);
    const user = await this.get(userId);
    if (!user) throw new Error('User missing');
    return user;
  }

  async updatePassword(userId: string, hash: string): Promise<void> {
    await this.db.runAsync('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', hash, new Date().toISOString(), userId);
  }

  async passwordHash(userId: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ? AND auth_provider = ?', userId, 'local');
    return row?.password_hash ?? null;
  }
}
