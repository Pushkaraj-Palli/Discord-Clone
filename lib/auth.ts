import { SignJWT, jwtVerify } from "jose"

// Secret key used for signing and verifying JWT tokens
export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT Secret key is not set in environment variables")
  }

  return new TextEncoder().encode(secret)
}

// Create a JWT token
export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(await getJwtSecretKey())
}

// Verify a JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, await getJwtSecretKey())
    return payload
  } catch (error) {
    throw new Error("Invalid token")
  }
} 