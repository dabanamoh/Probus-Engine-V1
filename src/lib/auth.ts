import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface DecodedToken {
  userId: string
  email: string
  role: string
  companyId?: string
  iat: number
  exp: number
}

export async function verifyToken(request: NextRequest): Promise<DecodedToken | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    
    // Verify session exists
    const session = await db.session.findFirst({
      where: {
        userId: decoded.userId,
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!session) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<DecodedToken> {
  const decoded = await verifyToken(request)
  
  if (!decoded) {
    throw new Error('Unauthorized')
  }
  
  return decoded
}

export async function requireRole(request: NextRequest, requiredRoles: string[]): Promise<DecodedToken> {
  const decoded = await requireAuth(request)
  
  if (!requiredRoles.includes(decoded.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return decoded
}

export function createAuthMiddleware(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    try {
      if (allowedRoles) {
        return await requireRole(request, allowedRoles)
      } else {
        return await requireAuth(request)
      }
    } catch (error) {
      throw error
    }
  }
}