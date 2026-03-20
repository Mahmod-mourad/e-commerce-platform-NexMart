import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: authUser.userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("GET wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const item = await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId: authUser.userId, productId },
      },
      create: { userId: authUser.userId, productId },
      update: {},
      include: { product: true },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("POST wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
