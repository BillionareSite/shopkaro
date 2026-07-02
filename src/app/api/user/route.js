import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUserFromRequest(req) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) return null
    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// GET — fetch full user profile from DB
export async function GET(req) {
  try {
    const payload = getUserFromRequest(req)
    if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        dob: true,
        gender: true,
        address: true,
        pincode: true,
        verified: true,
        createdAt: true
      }
    })

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// PATCH — update user profile (email cannot be changed)
export async function PATCH(req) {
  try {
    const payload = getUserFromRequest(req)
    if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, phone, whatsapp, dob, gender, address, pincode } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { email: payload.email },
      data: {
        name: name.trim(),
        phone: phone?.trim() || '',
        whatsapp: whatsapp?.trim() || '',
        dob: dob?.trim() || '',
        gender: gender?.trim() || '',
        address: address?.trim() || '',
        pincode: pincode?.trim() || ''
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        dob: true,
        gender: true,
        address: true,
        pincode: true,
        verified: true,
        createdAt: true
      }
    })

    return NextResponse.json({ message: 'Profile updated!', user: updated }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}