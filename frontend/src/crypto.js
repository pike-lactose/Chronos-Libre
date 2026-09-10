const ENCRYPTION_ITERATIONS = 600000;
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const SALT_SUFFIX = "-encryption-v1";

function encoder(str) {
  return new TextEncoder().encode(str);
}

function decoder(bytes) {
  return new TextDecoder().decode(bytes);
}

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function deriveKey(email, password) {
  const salt = encoder(email + SALT_SUFFIX);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ENCRYPTION_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder(plaintext)
  );
  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

export async function decrypt(key, ciphertext, iv) {
  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(ciphertext)
  );
  return decoder(plainBuffer);
}
