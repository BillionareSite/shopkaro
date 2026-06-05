import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    if (!process.env.IMGBB_API_KEY) {
      return NextResponse.json({ message: 'Upload service not configured' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    const params = new URLSearchParams()
    params.append('key', process.env.IMGBB_API_KEY)
    params.append('image', base64)
    params.append('name', `payment_proof_${Date.now()}`)

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: params
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('ImgBB Error:', errorText)
      return NextResponse.json({ message: 'Upload service failed' }, { status: 500 })
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ message: 'Upload failed: ' + (data.error?.message || 'Unknown error') }, { status: 500 })
    }

    return NextResponse.json({ url: data.data.url }, { status: 200 })
  } catch (error) {
    console.log('UPLOAD ERROR:', error.message)
    return NextResponse.json({ message: 'Upload failed: ' + error.message }, { status: 500 })
  }
}