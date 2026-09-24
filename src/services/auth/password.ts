import { getRandomBytes } from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

const ITERATIONS = 210_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = getRandomBytes(16);
  const hash = await pbkdf2Async(sha256, utf8ToBytes(password), salt, { c: ITERATIONS, dkLen: 32 });
  return `pbkdf2-sha256$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [method, rounds, saltHex, expectedHex] = stored.split('$');
  if (method !== 'pbkdf2-sha256' || !/^\d+$/.test(rounds) || !/^[0-9a-f]{32}$/.test(saltHex) || !/^[0-9a-f]{64}$/.test(expectedHex)) return false;
  const iterations = Number(rounds);
  if (iterations < 1 || iterations > 1_000_000) return false;
  const actual = await pbkdf2Async(sha256, utf8ToBytes(password), hexToBytes(saltHex), { c: iterations, dkLen: 32 });
  const expected = hexToBytes(expectedHex);
  let difference = 0;
  for (let index = 0; index < actual.length; index++) difference |= actual[index] ^ expected[index];
  return difference === 0;
}
