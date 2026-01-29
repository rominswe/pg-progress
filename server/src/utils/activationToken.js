import crypto from "crypto";

const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET || "supersecret";

export function generateActivationToken(userId, ttlMinutes = 30) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;

  const signature = crypto
    .createHmac("sha256", ACTIVATION_SECRET)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyActivationToken(token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [userId, expiresAt, signature] = decoded.split(".");

    if (Date.now() > Number(expiresAt)) throw new Error("Token expired");

    const expectedSig = crypto
      .createHmac("sha256", ACTIVATION_SECRET)
      .update(`${userId}.${expiresAt}`)
      .digest("hex");

    if (expectedSig !== signature) throw new Error("Invalid token");

    return userId;
  } catch {
    throw new Error("Invalid activation token");
  }
}