import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { ValidationError, readJsonBody } from "@/lib/validation"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Newsletter signup. The footer form had no endpoint behind it — it showed a
 * success message after a timeout and stored nothing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await readJsonBody(request)) as Record<string, unknown>
    const email = body.email

    if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
      throw new ValidationError("A valid email address is required")
    }

    const normalised = email.trim().toLowerCase()

    // Signing up twice is not an error worth showing a visitor, so this upserts
    // and reports success either way.
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalised },
      update: {},
      create: { email: normalised },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Newsletter signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
