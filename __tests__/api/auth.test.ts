import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn().mockResolvedValue("mock-jwt-token"),
  setAuthCookie: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}))

import { POST as register } from "@/app/api/auth/register/route"
import { POST as login } from "@/app/api/auth/login/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("succeeds with new email", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    })

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    })

    const response = await register(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.email).toBe("test@example.com")
    expect(data.password).toBeUndefined()
  })

  it("returns 409 with existing email", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    })

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    })

    const response = await register(request)
    expect(response.status).toBe(409)
  })

  it("returns 400 when fields are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    })

    const response = await register(request)
    expect(response.status).toBe(400)
  })
})

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns token with correct credentials", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      role: "user",
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    })

    const response = await login(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.email).toBe("test@example.com")
    expect(data.password).toBeUndefined()
  })

  it("returns 401 with wrong password", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed-password",
      role: "user",
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "wrong" }),
    })

    const response = await login(request)
    expect(response.status).toBe(401)
  })

  it("returns 401 with non-existent email", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@example.com", password: "password123" }),
    })

    const response = await login(request)
    expect(response.status).toBe(401)
  })
})
