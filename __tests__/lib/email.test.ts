import { readFileSync } from "fs"
import { join } from "path"

const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" })

jest.mock("nodemailer", () => ({
  createTestAccount: jest.fn().mockResolvedValue({
    user: "test@ethereal.email",
    pass: "test-password",
  }),
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
  getTestMessageUrl: jest.fn().mockReturnValue("http://test-preview-url"),
}))

import { sendOrderConfirmation } from "@/lib/email"

const mockOrder = {
  id: "order-1",
  total: 99.99,
  createdAt: new Date("2024-01-01"),
  user: {
    name: "Test User",
    email: "user@example.com",
  },
  items: [
    {
      product: { name: "Test Product" },
      quantity: 2,
      price: 49.99,
    },
  ],
  shippingDetails: {
    fullName: "Test User",
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    country: "Test Country",
    phone: "123-456-7890",
  },
}

describe("sendOrderConfirmation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAIL = "admin@test.com"
  })

  it("uses ADMIN_EMAIL from process.env as recipient", async () => {
    await sendOrderConfirmation(mockOrder)

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.to).toBe("admin@test.com")
  })

  it("sends a copy to the customer email", async () => {
    await sendOrderConfirmation(mockOrder)

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.cc).toBe("user@example.com")
  })
})

describe("lib/email.ts source", () => {
  it("does not contain hardcoded email address", () => {
    const content = readFileSync(join(process.cwd(), "lib/email.ts"), "utf-8")
    expect(content).not.toContain("mm203197@gmail.com")
  })

  it("uses process.env.ADMIN_EMAIL for the recipient", () => {
    const content = readFileSync(join(process.cwd(), "lib/email.ts"), "utf-8")
    expect(content).toContain("process.env.ADMIN_EMAIL")
  })
})
