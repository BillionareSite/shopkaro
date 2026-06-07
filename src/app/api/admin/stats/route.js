import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      allOrders,
      recentOrders,
      allUsers,
      lowStockProducts,
      pendingOrders,
      totalCoupons
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { cancellationRequest: true }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, verified: true, createdAt: true }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' }
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.coupon.count({ where: { isActive: true } })
    ])

    const totalRevenue = allOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)

    const deliveredRevenue = allOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0)

    const statusCounts = {
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    }

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      deliveredRevenue,
      pendingOrders,
      totalCoupons,
      statusCounts,
      recentOrders,
      allUsers,
      lowStockProducts
    }, { status: 200 })
  } catch (error) {
    console.log('STATS ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}