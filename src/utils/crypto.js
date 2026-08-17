const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// OWASP's floor for PBKDF2-SHA256. It matters now: the secret behind the key is
// a short PIN, so the cost per guess is the only thing making an offline
// attack expensive.
const ITERATIONS = 600000;

// The original scheme derived the key from the user id with 100k iterations.
// Kept solely so entries written before the change can still be read once and
// re-encrypted; nothing new is ever written with it.
const LEGACY_ITERATIONS = 100000;

const FORMAT_VERSION = 2;

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function generateVaultSalt() {
  return bufferToBase64(crypto.getRandomValues(new Uint8Array(SALT_LENGTH)));
}

async function deriveKey(secret, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * The vault key: PBKDF2 over the PIN the user typed, salted per account.
 * Never persist the result — hold it in memory for as long as the vault is
 * unlocked and drop it after that.
 */
export async function deriveVaultKey(pin, saltBase64) {
  if (!pin || !saltBase64) return null;
  return deriveKey(pin, new Uint8Array(base64ToBuffer(saltBase64)), ITERATIONS);
}

async function deriveLegacyKey(userId) {
  const salt = new TextEncoder().encode('vault-salt-v1-' + userId.slice(0, 8));
  return deriveKey(userId, salt, LEGACY_ITERATIONS);
}

export function isLegacyEntry(encryptedJson) {
  try {
    return JSON.parse(encryptedJson)?.v !== FORMAT_VERSION;
  } catch {
    return false;
  }
}

export async function encryptPassword(plainText, key) {
  if (!key) throw new Error('Vault is locked');
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    new TextEncoder().encode(plainText)
  );

  return JSON.stringify({
    v: FORMAT_VERSION,
    iv: bufferToBase64(iv),
    data: bufferToBase64(cipherBuffer),
  });
}

/**
 * Reads both formats. `key` decrypts current entries; `userId` is only used to
 * rebuild the old key for entries that predate the change, so they can be read
 * once and rewritten.
 */
export async function decryptPassword(encryptedJson, { key, userId } = {}) {
  let parsed;
  try {
    parsed = JSON.parse(encryptedJson);
  } catch {
    return '';
  }
  if (!parsed?.iv || !parsed?.data) return '';

  const isCurrent = parsed.v === FORMAT_VERSION;
  if (isCurrent && !key) return '';
  if (!isCurrent && !userId) return '';

  try {
    const decryptionKey = isCurrent ? key : await deriveLegacyKey(userId);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv: base64ToBuffer(parsed.iv) },
      decryptionKey,
      base64ToBuffer(parsed.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return '';
  }
}
