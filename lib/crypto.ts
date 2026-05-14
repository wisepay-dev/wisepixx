import crypto from "node:crypto";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is required");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes encoded as base64");
  return key;
}

export async function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export async function decryptSecret(payload: string) {
  const bytes = Buffer.from(payload, "base64");
  const iv = bytes.subarray(0, 12);
  const tag = bytes.subarray(12, 28);
  const ciphertext = bytes.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export async function hashIp(ip: string | null | undefined) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? "wisepix"}`).digest("hex");
}

export async function verifyHmacSha256(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const incoming = signature.replace(/^sha256=/, "");
  const expectedBytes = Buffer.from(expected, "hex");
  const incomingBytes = Buffer.from(incoming, "hex");
  if (expectedBytes.length !== incomingBytes.length) return false;
  return crypto.timingSafeEqual(expectedBytes, incomingBytes);
}
