import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: 'Missing payment details' }, { status: 400 })
    }

    // Recreate the signature using YOUR secret key and compare
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ message: 'Payment verification failed! Signature mismatch.' }, { status: 400 })
    }

    // Signature matches — this payment is genuinely from Razorpay and was not tampered with
    return NextResponse.json({
      message: 'Payment verified successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    }, { status: 200 })

  } catch (error) {
    console.log('RAZORPAY VERIFY ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}