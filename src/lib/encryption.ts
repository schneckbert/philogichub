import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): Buffer {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('API_KEY_ENCRYPTION_KEY is not set in environment');
  }

  // Convert hex string to buffer
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt an API key
 */
export function encryptApiKey(plaintext: string): {
  encrypted: string;
  hash: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Combine salt, iv, tag, and encrypted data
  const combined = Buffer.concat([salt, iv, tag, encrypted]);

  // Create hash for lookups (never store plaintext)
  const hash = crypto
    .createHash('sha256')
    .update(plaintext)
    .digest('hex');

  return {
    encrypted: combined.toString('base64'),
    hash,
  };
}

/**
 * Decrypt an API key
 */
export function decryptApiKey(encryptedString: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedString, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Create a preview of an API key (e.g., "sk-xxx...abcd")
 */
export function createKeyPreview(key: string): string {
  if (key.length < 8) {
    return key;
  }

  const prefix = key.substring(0, 6);
  const suffix = key.substring(key.length - 4);

  return `${prefix}...${suffix}`;
}

/**
 * Hash an API key for lookup
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKeyFormat(key: string, provider: string): boolean {
  switch (provider) {
    case 'openai':
      return /^sk-[A-Za-z0-9]{48}$/.test(key) || /^sk-proj-[A-Za-z0-9_-]{48,}$/.test(key);
    case 'anthropic':
      return /^sk-ant-api\d{2}-[A-Za-z0-9_-]{95}$/.test(key);
    case 'google':
      return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
    default:
      // Generic check: at least 20 characters
      return key.length >= 20;
  }
}
