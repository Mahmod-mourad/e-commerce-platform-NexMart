import { NextResponse, type NextRequest } from "next/server"

import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ValidationError, readJsonBody } from "@/lib/validation"

/**
 * Product reviews.
 *
 * The Review model has been in the schema from the start, but there was no
 * endpoint behind it — the reviews component built a list in the browser and
 * threw it away on refresh.
 */

export async function GET(request: NextRequest) {
  try {
    const productId = new URL(request.url).searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        // Never select the user's password hash or email into a public response.
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("GET reviews error:", error)
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

    const productId = body.productId
    if (typeof productId !== "string" || productId.trim() === "") {
      throw new ValidationError("productId is required")
    }

    const rating = body.rating
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("rating must be a whole number from 1 to 5")
    }

    const comment = body.comment
    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      throw new ValidationError("comment must be text")
    }
    if (typeof comment === "string" && comment.length > 2000) {
      throw new ValidationError("comment must be 2000 characters or fewer")
    }

    // You can only review something you have actually bought and paid for.
    // Without this, anyone with an account could flood any product with ratings.
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: authUser.userId, status: "paid" },
      },
      select: { id: true },
    })

    if (!purchased) {
      return NextResponse.json(
        { error: "You can only review a product you have purchased" },
        { status: 403 },
      )
    }

    const existing = await prisma.review.findFirst({
      where: { productId, userId: authUser.userId },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 })
    }

    // Writing the review and recomputing the product's average have to happen
    // together, or the rating shown on the product drifts from its reviews.
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId,
          userId: authUser.userId,
          rating,
          comment: typeof comment === "string" ? comment.trim() : null,
        },
        include: { user: { select: { id: true, name: true, image: true } } },
      })

      const { _avg } = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      })

      await tx.product.update({
        where: { id: productId },
        data: { rating: Number((_avg.rating ?? 0).toFixed(2)) },
      })

      return created
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("POST reviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
