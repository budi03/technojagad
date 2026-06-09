// ─────────────────────────────────────────────────────────────────────────────
// lib/jwt.js
//
// PENTING: File ini dipakai di DUA konteks berbeda:
//   1. middleware.js  → Edge Runtime (tidak support Node.js built-ins)
//   2. API routes     → Node.js Runtime (support penuh)
//
// Solusi: gunakan jose (Web Crypto API) yang kompatibel di kedua runtime.
// Install: npm install jose
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'technojagad_secret_key_ganti_ini';

// Encode secret ke format yang dibutuhkan jose
function getSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Sign JWT — bisa dipanggil dari API route maupun middleware
 * @param {object} payload
 * @returns {Promise<string>} token string
 */
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

/**
 * Verify JWT — kompatibel dengan Edge Runtime (middleware)
 * @param {string} token
 * @returns {object|null} payload jika valid, null jika invalid/expired
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}