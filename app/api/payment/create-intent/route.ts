import { NextResponse, type NextRequest } from "next/server"
import Stripe from "stripe"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items } = await request.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    const productIds: string[] = items.map((item: { id: string }) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    })
    const priceMap = new Map(products.map((p) => [p.id, p.price]))

    let serverTotal = 0
    for (const item of items as { id: string; quantity: number }[]) {
      const price = priceMap.get(item.id)
      if (price === undefined) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 })
      }
      serverTotal += price * item.quantity
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotal * 100), // Stripe uses cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Create payment intent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
