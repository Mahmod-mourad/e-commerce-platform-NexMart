import { NextRequest } from "next/server"

const constructEvent = jest.fn()

jest.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent } }),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { updateMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    product: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { POST } from "@/app/api/webhooks/stripe/route"
import { prisma } from "@/lib/prisma"

const ORDER_ID = "order-1"

function webhookRequest(body = "{}", signature: string | null = "t=1,v1=abc") {
  const headers = new Headers()
  if (signature) headers.set("stripe-signature", signature)

  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  })
}

function paymentIntent(overrides: Record<string, unknown> = {}) {
  return { id: "pi_123", metadata: { orderId: ORDER_ID }, ...overrides }
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test"
    ;(prisma.order.updateMany as jest.Mock).mockResolvedValue({ count: 1 })
    ;(prisma.$transaction as jest.Mock).mockImplementation(async (work) =>
      work({
        order: prisma.order,
        product: prisma.product,
      }),
    )
  })

  describe("authenticity", () => {
    it("rejects a request with no signature header", async () => {
      const response = await POST(webhookRequest("{}", null))

      expect(response.status).toBe(400)
      expect(constructEvent).not.toHaveBeenCalled()
    })

    it("rejects a body whose signature does not verify", async () => {
      constructEvent.mockImplementation(() => {
        throw new Error("No signatures found matching the expected signature")
      })

      const response = await POST(webhookRequest())

      // This is the whole security boundary: anyone can POST to this URL, so a
      // forged body must never reach the handlers.
      expect(response.status).toBe(400)
      expect(prisma.order.updateMany).not.toHaveBeenCalled()
    })

    it("refuses to process anything when the signing secret is unset", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      const response = await POST(webhookRequest())

      expect(response.status).toBe(500)
      expect(constructEvent).not.toHaveBeenCalled()
    })
  })

  describe("payment_intent.succeeded", () => {
    beforeEach(() => {
      constructEvent.mockReturnValue({
        type: "payment_intent.succeeded",
        data: { object: paymentIntent() },
      })
    })

    it("marks the order paid", async () => {
      const response = await POST(webhookRequest())

      expect(response.status).toBe(200)
      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: { id: ORDER_ID, status: "pending" },
        data: { status: "paid" },
      })
    })

    it("only settles an order that is still pending", async () => {
      await POST(webhookRequest())

      // Stripe delivers at least once and retries on any non-2xx, so the same
      // event can arrive repeatedly. Scoping to pending makes a repeat a no-op
      // rather than a second state change.
      const call = (prisma.order.updateMany as jest.Mock).mock.calls[0][0]
      expect(call.where.status).toBe("pending")
    })

    it("acknowledges a duplicate delivery instead of erroring", async () => {
      ;(prisma.order.updateMany as jest.Mock).mockResolvedValue({ count: 0 })

      const response = await POST(webhookRequest())

      // A non-2xx would make Stripe retry an event that is already handled.
      expect(response.status).toBe(200)
    })

    it("ignores an intent with no order id rather than throwing", async () => {
      constructEvent.mockReturnValue({
        type: "payment_intent.succeeded",
        data: { object: paymentIntent({ metadata: {} }) },
      })

      const response = await POST(webhookRequest())

      expect(response.status).toBe(200)
      expect(prisma.order.updateMany).not.toHaveBeenCalled()
    })
  })

  describe("payment_intent.payment_failed", () => {
    beforeEach(() => {
      constructEvent.mockReturnValue({
        type: "payment_intent.payment_failed",
        data: { object: paymentIntent() },
      })
    })

    it("returns the reserved stock and marks the order failed", async () => {
      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue({
        id: ORDER_ID,
        items: [
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
        ],
      })

      const response = await POST(webhookRequest())

      expect(response.status).toBe(200)
      // Stock was decremented when the order was created; a failed payment has to
      // give it back or the items stay held against an order nobody will pay for.
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { stock: { increment: 2 } },
      })
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "p2" },
        data: { stock: { increment: 1 } },
      })
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: ORDER_ID },
        data: { status: "payment_failed" },
      })
    })

    it("does nothing for an order that is no longer pending", async () => {
      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await POST(webhookRequest())

      expect(response.status).toBe(200)
      expect(prisma.product.update).not.toHaveBeenCalled()
      expect(prisma.order.update).not.toHaveBeenCalled()
    })
  })

  it("acknowledges event types it has no opinion about", async () => {
    constructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(prisma.order.updateMany).not.toHaveBeenCalled()
  })
})
