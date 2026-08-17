/*
  Holds the derived vault key for as long as the vault is unlocked.

  Module scope, never storage. Putting it in localStorage or sessionStorage
  would hand the key to anything that can read them, which is the problem this
  whole change exists to fix. The cost is that a full page reload locks the
  vault again — that is the intended trade, not an oversight.
*/

let key = null;
let expiresAt = 0;

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function setVaultKey(cryptoKey, ttlMs = DEFAULT_TTL_MS) {
  key = cryptoKey;
  expiresAt = Date.now() + ttlMs;
}

export function getVaultKey() {
  if (!key) return null;
  if (Date.now() > expiresAt) {
    clearVaultKey();
    return null;
  }
  return key;
}

export function clearVaultKey() {
  key = null;
  expiresAt = 0;
}
