import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [products, orders, users] = await Promise.all([
      prisma.product.findMany(),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

    const usersWithOrders = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      orders: orders.filter(o => o.email === user.email)
    }))

    return NextResponse.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      totalUsers: users.length,
      recentOrders: orders.slice(0, 5),
      users: usersWithOrders
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}