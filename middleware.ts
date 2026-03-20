import { NextResponse, type NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  const token = request.cookies.get("auth-token")?.value

  // /api/products POST → admins only
  if (pathname === "/api/products" && method === "POST") {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // /api/products/[id] PUT/DELETE → admins only
  if (pathname.match(/^\/api\/products\/[^/]+$/) && (method === "PUT" || method === "DELETE")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // /api/orders GET/POST → authenticated users only
  if (pathname === "/api/orders" && (method === "GET" || method === "POST")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // /api/wishlist → authenticated users only
  if (pathname.startsWith("/api/wishlist")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/products", "/api/products/:path*", "/api/orders", "/api/wishlist", "/api/wishlist/:path*"],
}
