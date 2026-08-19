import { NextResponse, type NextRequest } from "next/server"

import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * A single order.
 *
 * The order detail page had no endpoint to call, so it invented an order in the
 * browser from the id in the URL.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Scoped by userId as well as id. Looking up by id alone would let anyone read
    // any order by guessing its identifier — admins get everything, everyone else
    // gets their own.
    const order = await prisma.order.findFirst({
      where: authUser.role === "admin" ? { id } : { id, userId: authUser.userId },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!order) {
      // Deliberately 404 rather than 403: telling someone an order exists but is
      // not theirs confirms the id is real.
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("GET order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
