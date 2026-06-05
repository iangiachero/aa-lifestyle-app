const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function deriveKey(userId) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('vault-salt-v1-' + userId.slice(0, 8)),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptPassword(plainText, userId) {
  const key = await deriveKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encoder.encode(plainText)
  );

  return JSON.stringify({
    iv: bufferToBase64(iv),
    data: bufferToBase64(cipherBuffer),
  });
}

export async function decryptPassword(encryptedJson, userId) {
  try {
    const { iv, data } = JSON.parse(encryptedJson);
    const key = await deriveKey(userId);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ALGO, iv: base64ToBuffer(iv) },
      key,
      base64ToBuffer(data)
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    return '';
  }
}
