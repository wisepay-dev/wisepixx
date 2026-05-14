function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is required");
  const key = base64ToBytes(raw);
  if (key.byteLength !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes encoded as base64");
  return key;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  const clean = value.replace(/^sha256=/, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let index = 0; index < clean.length; index += 2) bytes[index / 2] = Number.parseInt(clean.slice(index, index + 2), 16);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let index = 0; index < a.byteLength; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

async function aesKey() {
  return crypto.subtle.importKey("raw", getKey(), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), encoder.encode(value)));
  const payload = new Uint8Array(iv.byteLength + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(encrypted, iv.byteLength);
  return bytesToBase64(payload);
}

export async function decryptSecret(payload: string) {
  const bytes = base64ToBytes(payload);
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await aesKey(), ciphertext);
  return decoder.decode(decrypted);
}

export async function hashIp(ip: string | null | undefined) {
  if (!ip) return null;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${ip}:${process.env.AUTH_SECRET ?? "wisepix"}`));
  return bytesToHex(new Uint8Array(digest));
}

export async function verifyHmacSha256(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody)));
  const incoming = hexToBytes(signature);
  return timingSafeEqual(expected, incoming);
}
