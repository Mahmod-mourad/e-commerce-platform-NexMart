import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock("@/lib/auth", () => ({
  getAuthUser: jest.fn(),
}))

import { GET, POST } from "@/app/api/products/route"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>

describe("GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.product.count as jest.Mock).mockResolvedValue(0)
  })

  it("returns products with pagination", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 10,
        category: "electronics",
        createdAt: new Date(),
      },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
    ;(prisma.product.count as jest.Mock).mockResolvedValue(1)

    const request = new NextRequest("http://localhost:3000/api/products?page=1&limit=10")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toEqual(mockProducts)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(1)
    expect(data.pagination.pages).toBe(1)
  })
})

describe("POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 without auth", async () => {
    mockGetAuthUser.mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({ name: "Product" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it("returns 403 for non-admin user", async () => {
    mockGetAuthUser.mockResolvedValue({
      userId: "user-id",
      email: "user@test.com",
      role: "user",
    })

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({ name: "Product" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it("succeeds with admin token", async () => {
    mockGetAuthUser.mockResolvedValue({
      userId: "admin-id",
      email: "admin@test.com",
      role: "admin",
    })

    const mockProduct = { id: "1", name: "New Product", price: 100 }
    ;(prisma.product.create as jest.Mock).mockResolvedValue(mockProduct)

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({ name: "New Product", price: 100 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockProduct)
  })
})
