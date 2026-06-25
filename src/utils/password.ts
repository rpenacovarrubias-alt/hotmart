// Password hashing using PBKDF2 + SHA-256 via Web Crypto API (browser-native, no dependencies)
// Salt format: "cohost:<userId>" — deterministic per user, stored alongside the hash is not needed

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits

function str2buf(s: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(s);
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
}

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveKey(password: string, salt: string): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    str2buf(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: str2buf(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8,
  );
}

// Salt is derived from userId so it's deterministic and doesn't need separate storage
export async function hashPassword(password: string, userId: string): Promise<string> {
  const salt = `cohost:${userId}`;
  const bits = await deriveKey(password, salt);
  return buf2hex(bits);
}

export async function verifyPassword(password: string, userId: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(password, userId);
  return hash === storedHash;
}
