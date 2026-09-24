export type AuthErrorCode = 'required' | 'invalidEmail' | 'weakPassword' | 'passwordMismatch' | 'duplicateEmail' | 'invalidCredentials' | 'incorrectCurrentPassword' | 'invalidDisplayName' | 'invalidAvatarUrl' | 'unavailable';
export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) { super(code); }
}
export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
export function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) throw new AuthError('invalidEmail');
}
export function validatePassword(password: string): void {
  if (password.length < 8 || password.length > 128) throw new AuthError('weakPassword');
}
export function validateDisplayName(name: string): void {
  if (name.trim().length < 1 || name.trim().length > 60) throw new AuthError('invalidDisplayName');
}
