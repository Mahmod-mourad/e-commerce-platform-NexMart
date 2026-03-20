import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmation } from "@/lib/email"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Ensure users can only access their own orders
    if (userId && userId !== authUser.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: authUser.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("GET orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const productIds: string[] = data.items.map((item: { id: string }) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    })
    const priceMap = new Map(products.map((p) => [p.id, p.price]))

    const itemsWithServerPrice = data.items.map((item: { id: string; quantity: number }) => {
      const price = priceMap.get(item.id)
      if (price === undefined) throw new Error(`Product not found: ${item.id}`)
      return { productId: item.id, quantity: item.quantity, price }
    })

    const serverTotal = itemsWithServerPrice.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: authUser.userId,
        total: serverTotal,
        status: "pending",
        paymentMethod: data.paymentMethod,
        shippingDetails: data.shippingDetails,
        items: {
          create: itemsWithServerPrice,
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    })

    await sendOrderConfirmation({
      ...order,
      shippingDetails: order.shippingDetails as {
        fullName: string
        address: string
        city: string
        state: string
        zipCode: string
        country: string
        phone: string
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("POST orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
