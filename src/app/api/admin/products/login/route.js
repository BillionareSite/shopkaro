import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'shopkaro@admin123'

export async function POST(req) {
  try {
    const { password } = await req.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: 'Wrong password!' }, { status: 401 })
    }

    const response = NextResponse.json({ message: 'Access granted!' }, { status: 200 })
    response.cookies.set('admin_auth', ADMIN_PASSWORD, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}