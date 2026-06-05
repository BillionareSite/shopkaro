import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: process.env.IMGBB_API_KEY,
        image: base64,
        name: `payment_proof_${Date.now()}`
      })
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ message: 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({ url: data.data.url }, { status: 200 })
  } catch (error) {
    console.log('UPLOAD ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}