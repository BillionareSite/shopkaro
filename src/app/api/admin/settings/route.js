import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst()
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          paymentMethods: { cod: true, upi: false, bank: false, card: false },
          upiId: '',
          bankDetails: ''
        }
      })
    }
    return NextResponse.json({ settings }, { status: 200 })
  } catch (error) {
    console.log('SETTINGS ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json()
    let settings = await prisma.storeSettings.findFirst()

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          paymentMethods: body.paymentMethods || { cod: true, upi: false, bank: false, card: false },
          upiId: body.upiId || '',
          bankDetails: body.bankDetails || ''
        }
      })
    } else {
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          paymentMethods: body.paymentMethods,
          upiId: body.upiId || '',
          bankDetails: body.bankDetails || ''
        }
      })
    }

    return NextResponse.json({ message: 'Settings saved!', settings }, { status: 200 })
  } catch (error) {
    console.log('SETTINGS PATCH ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}