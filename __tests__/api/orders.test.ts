import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: jest.fn(), create: jest.fn() },
    product: { findMany: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}))

jest.mock("@/lib/auth", () => ({ getAuthUser: jest.fn() }))
jest.mock("@/lib/email", () => ({ sendOrderConfirmation: jest.fn() }))

import { GET, POST } from "@/app/api/orders/route"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { sendOrderConfirmation } from "@/lib/email"

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>
const mockSendEmail = sendOrderConfirmation as jest.Mock

const USER = { userId: "user-1", email: "nour@example.com", role: "user" }

const SHIPPING = {
  fullName: "Nour Hassan",
  email: "nour@example.com",
  address: "12 Nile St",
  city: "Cairo",
  state: "Cairo",
  zipCode: "11511",
  country: "Egypt",
  phone: "+201234567890",
}

/** Stock levels the fake transaction serves, keyed by product id. */
let catalogue: { id: string; name: string; price: number; stock: number }[] = []
let decrements: { id: string; quantity: number }[] = []
let createdOrder: Record<string, unknown> | undefined

function request(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  decrements = []
  createdOrder = undefined
  catalogue = [
    { id: "p1", name: "Laptop", price: 1000, stock: 5 },
    { id: "p2", name: "Mouse", price: 25, stock: 2 },
  ]
  mockGetAuthUser.mockResolvedValue(USER)
  mockSendEmail.mockResolvedValue(undefined)

  const tx = {
    product: {
      findMany: jest.fn(async ({ where }: { where: { id: { in: string[] } } }) =>
        catalogue.filter((p) => where.id.in.includes(p.id)),
      ),
      updateMany: jest.fn(async ({ where, data }: never) => {
        const w = where as { id: string; stock: { gte: number } }
        const product = catalogue.find((p) => p.id === w.id)
        if (!product || product.stock < w.stock.gte) return { count: 0 }
        product.stock -= (data as { stock: { decrement: number } }).stock.decrement
        decrements.push({ id: w.id, quantity: (data as never as { stock: { decrement: number } }).stock.decrement })
        return { count: 1 }
      }),
    },
    order: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        createdOrder = data
        return { id: "order-1", ...data, items: [], user: { name: "Nour", email: USER.email } }
      }),
    },
  }

  ;(prisma.$transaction as jest.Mock).mockImplementation((work: (t: unknown) => unknown) => work(tx))
})

describe("POST /api/orders", () => {
  it("prices the order from the database, not the request", async () => {
    const response = await POST(
      request({
        items: [{ id: "p1", quantity: 2 }],
        // A tampered cart claiming the laptop costs a pound.
        prices: { p1: 1 },
        total: 1,
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(response.status).toBe(201)
    expect(createdOrder?.total).toBe(2000)
  })

  it("refuses to sell more than the stock on hand", async () => {
    const response = await POST(
      request({
        items: [{ id: "p2", quantity: 3 }], // only 2 in stock
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("stock"),
    })
  })

  it("decrements stock for every line", async () => {
    await POST(
      request({
        items: [
          { id: "p1", quantity: 2 },
          { id: "p2", quantity: 1 },
        ],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(decrements).toEqual([
      { id: "p1", quantity: 2 },
      { id: "p2", quantity: 1 },
    ])
  })

  it("rejects a negative quantity", async () => {
    // Before validation existed this produced a negative line total, which
    // reduced the order value.
    const response = await POST(
      request({
        items: [{ id: "p1", quantity: -3 }],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(response.status).toBe(400)
  })

  it("rejects an unknown product with a 400, not a 500", async () => {
    const response = await POST(
      request({
        items: [{ id: "does-not-exist", quantity: 1 }],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(response.status).toBe(400)
  })

  it("rejects a missing shipping address", async () => {
    const response = await POST(
      request({ items: [{ id: "p1", quantity: 1 }], paymentMethod: "credit_card" }),
    )

    expect(response.status).toBe(400)
  })

  it("rejects an unsupported payment method", async () => {
    const response = await POST(
      request({
        items: [{ id: "p1", quantity: 1 }],
        shippingDetails: SHIPPING,
        paymentMethod: "bitcoin",
      }),
    )

    expect(response.status).toBe(400)
  })

  it("creates the order as pending, never as paid", async () => {
    await POST(
      request({
        items: [{ id: "p1", quantity: 1 }],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    // Only the Stripe webhook may move an order to paid.
    expect(createdOrder?.status).toBe("pending")
  })

  it("still returns the order when the confirmation email fails", async () => {
    mockSendEmail.mockRejectedValue(new Error("SMTP unavailable"))

    const response = await POST(
      request({
        items: [{ id: "p1", quantity: 1 }],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    // The order exists. A mail server being down is not a reason to tell the
    // customer their purchase failed.
    expect(response.status).toBe(201)
  })

  it("requires a signed-in user", async () => {
    mockGetAuthUser.mockResolvedValue(null)

    const response = await POST(
      request({
        items: [{ id: "p1", quantity: 1 }],
        shippingDetails: SHIPPING,
        paymentMethod: "credit_card",
      }),
    )

    expect(response.status).toBe(401)
  })
})

describe("GET /api/orders", () => {
  it("only ever reads the caller's own orders", async () => {
    ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])

    await GET(new NextRequest("http://localhost/api/orders"))

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER.userId } }),
    )
  })

  it("refuses a userId query parameter belonging to someone else", async () => {
    const response = await GET(new NextRequest("http://localhost/api/orders?userId=someone-else"))

    expect(response.status).toBe(403)
  })
})
