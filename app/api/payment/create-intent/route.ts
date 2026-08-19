import { NextResponse, type NextRequest } from "next/server"

import { getStripe } from "@/lib/stripe"

import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ValidationError, readJsonBody } from "@/lib/validation"


/**
 * Creates a Stripe payment intent for an order that already exists.
 *
 * This used to take a cart from the request and price it, which meant the amount
 * charged and the order recorded were computed in two different places from two
 * different inputs. It now reads the order — so there is one total, and the
 * intent carries the order id so the webhook knows what to settle.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await readJsonBody(request)) as Record<string, unknown>
    const orderId = body.orderId

    if (typeof orderId !== "string" || orderId.trim() === "") {
      throw new ValidationError("orderId is required")
    }

    // Scoped by userId as well as id: you can only pay for your own order.
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: authUser.userId },
      select: { id: true, total: true, status: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "pending") {
      throw new ValidationError(`This order is already ${order.status}`)
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      // Stripe works in the smallest currency unit, so this is cents.
      amount: Math.round(order.total * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      // The webhook has nothing else to identify the order by.
      metadata: { orderId: order.id, userId: authUser.userId },
    })

    return NextResponse.json({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Create payment intent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
