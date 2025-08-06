import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create company if provided
    let company = null
    if (companyName) {
      company = await db.company.create({
        data: {
          name: companyName,
          subscription: 'BASIC'
        }
      })
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyId: company?.id,
        role: company ? 'ADMIN' : 'USER',
        language: 'en'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subscription: true
          }
        }
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        companyId: user.companyId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create session
    const session = await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        company: user.company
      },
      token,
      session: {
        id: session.id,
        expiresAt: session.expiresAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}