import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

console.log('MONGODB_URI:', MONGODB_URI)

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached connection')
    return cached.conn
  }

  try {
    console.log('Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    })
    cached.conn = await cached.promise
    console.log('MongoDB connected successfully!')
    return cached.conn
  } catch (error) {
    console.log('MongoDB connection error:', error.message)
    throw error
  }
}

export default connectDB