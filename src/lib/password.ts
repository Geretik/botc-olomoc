import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

function scrypt(password: string, salt: Buffer, keylen: number, N: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, { N }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

// Stored as "scrypt$<N>$<salt hex>$<hash hex>" so the parameters can change later.
const N = 16384;
const KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, N);
  return `scrypt$${N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, saltHex, hashHex] = stored.split("$");
  if (algo !== "scrypt" || !n || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length, Number(n));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const PASSWORD_MIN_LENGTH = 10;
