import { NextResponse, type NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { sendOrderConfirmation } from "@/lib/email"
import { getAuthUser } from "@/lib/auth"
import {
  ValidationError,
  parseCartItems,
  parsePaymentMethod,
  parseShippingDetails,
  readJsonBody,
} from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Orders are always read for the signed-in user. The userId query parameter is
    // only honoured when it matches, so it cannot be used to read anyone else's.
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (userId && userId !== authUser.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: authUser.userId },
      include: { items: { include: { product: true } } },
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

    const body = (await readJsonBody(request)) as Record<string, unknown>
    const items = parseCartItems(body.items)
    const shippingDetails = parseShippingDetails(body.shippingDetails)
    const paymentMethod = parsePaymentMethod(body.paymentMethod)

    // Everything below is one transaction. Reserving stock and creating the order
    // have to succeed or fail together — otherwise a failure part way through
    // leaves stock decremented against an order that does not exist.
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((item) => item.id) } },
        select: { id: true, name: true, price: true, stock: true },
      })

      const byId = new Map(products.map((product) => [product.id, product]))

      const lines = items.map((item) => {
        const product = byId.get(item.id)
        if (!product) {
          throw new ValidationError(`Product not found: ${item.id}`)
        }
        if (product.stock < item.quantity) {
          throw new ValidationError(
            `Not enough stock for ${product.name}: ${product.stock} left, ${item.quantity} requested`,
          )
        }
        // The price comes from the database row, never from the request, so a
        // tampered cart cannot set what the customer is charged.
        return { productId: product.id, quantity: item.quantity, price: product.price }
      })

      // Conditional decrements. `stock: { gte: quantity }` in the where clause means
      // two orders racing for the last unit cannot both succeed — the second one
      // matches no rows and throws, rolling the transaction back.
      for (const line of lines) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        })

        if (updated.count === 0) {
          throw new ValidationError(
            `Not enough stock for ${byId.get(line.productId)?.name ?? line.productId}`,
          )
        }
      }

      const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

      return tx.order.create({
        data: {
          userId: authUser.userId,
          total: Number(total.toFixed(2)),
          status: "pending",
          paymentMethod,
          shippingDetails: shippingDetails as unknown as Prisma.InputJsonValue,
          items: { create: lines },
        },
        include: {
          items: { include: { product: true } },
          user: true,
        },
      })
    })

    // The order exists at this point. A mail server being down is not a reason to
    // tell the customer their order failed, so this is logged rather than thrown.
    try {
      await sendOrderConfirmation({
        ...order,
        shippingDetails,
      })
    } catch (emailError) {
      console.error(`Order ${order.id} created but the confirmation email failed:`, emailError)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("POST orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
