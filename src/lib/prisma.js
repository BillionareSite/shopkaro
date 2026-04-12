import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = global

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma