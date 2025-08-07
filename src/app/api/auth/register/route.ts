import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { Company } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, companyName } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let company: Company | null = null
    if (companyName) {
      company = await db.company.create({
        data: {
          name: companyName,
          subscription: 'BASIC'
        }
      })
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // ✅ This is the fix
        role: company ? 'ADMIN' : 'USER',
        companyId: company?.id || null
      }
    })

    return NextResponse.json({ message: 'User registered successfully', user })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
