import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"

import { getStripe } from "@/lib/stripe"

import { prisma } from "@/lib/prisma"

/**
 * Stripe webhook.
 *
 * Without this, `POST /api/payment/create-intent` created a payment intent and
 * nothing ever heard back: the customer paid, Stripe recorded it, and the order
 * sat at "pending" forever. The browser cannot be the thing that confirms a
 * payment — it can lie, and it can also just close the tab after paying.
 *
 * Configure the endpoint in the Stripe dashboard against /api/webhooks/stripe,
 * and put the signing secret in STRIPE_WEBHOOK_SECRET.
 */


// Stripe needs the exact bytes it signed, so the body must not be parsed first.
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; refusing to process webhooks")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    // This is the whole security boundary. Anyone can POST to this URL; only
    // Stripe can produce a body that verifies against the signing secret.
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error("Stripe signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await markOrderPaid(event.data.object)
        break

      case "payment_intent.payment_failed":
        await markOrderFailed(event.data.object)
        break

      default:
        // Everything else is acknowledged and ignored. Returning an error would
        // make Stripe retry an event this app has no opinion about.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // A non-2xx tells Stripe to retry, which is what we want if the database was
    // briefly unavailable.
    console.error(`Failed to handle ${event.type}:`, error)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }
}

async function markOrderPaid(intent: Stripe.PaymentIntent): Promise<void> {
  const orderId = intent.metadata?.orderId

  if (!orderId) {
    console.error(`payment_intent ${intent.id} arrived with no orderId in metadata`)
    return
  }

  // Stripe delivers at least once, and will redeliver on any non-2xx, so the same
  // event can arrive several times. Scoping the update to orders that are still
  // pending makes a repeat delivery a no-op instead of a second state change.
  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "paid" },
  })

  if (updated.count === 0) {
    console.log(`Order ${orderId} was already settled; ignoring duplicate ${intent.id}`)
  }
}

async function markOrderFailed(intent: Stripe.PaymentIntent): Promise<void> {
  const orderId = intent.metadata?.orderId

  if (!orderId) return

  // Releasing the reserved stock and marking the order failed have to happen
  // together, or the stock stays held against an order nobody will pay for.
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, status: "pending" },
      include: { items: true },
    })

    if (!order) return

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "payment_failed" },
    })
  })
}
