import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"

import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ValidationError, readJsonBody } from "@/lib/validation"



export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Updates the signed-in user's own name or email.
 *
 * Passwords go through POST /api/auth/change-password instead — a password change
 * has its own rules and belongs on its own route.
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await readJsonBody(request)) as Record<string, unknown>

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const changes: { name?: string; email?: string } = {}

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        throw new ValidationError("name must be at least 2 characters")
      }
      changes.name = body.name.trim()
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        throw new ValidationError("email is not valid")
      }

      const email = body.email.trim().toLowerCase()

      if (email !== user.email) {
        const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } })
        if (taken) {
          return NextResponse.json({ error: "That email is already in use" }, { status: 409 })
        }
        changes.email = email
      }
    }

    if (Object.keys(changes).length === 0) {
      throw new ValidationError("nothing to update")
    }

    // Taking over an account starts with changing the email on it, so an email
    // change requires the current password. A name change on its own does not.
    const needsPassword = changes.email !== undefined

    if (needsPassword) {
      if (typeof body.currentPassword !== "string" || body.currentPassword === "") {
        throw new ValidationError("currentPassword is required to change your email")
      }

      const matches = await bcrypt.compare(body.currentPassword, user.password)
      if (!matches) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 })
      }
    }

    // `role` is deliberately never read from the body. Accepting it would let any
    // signed-in user make themselves an admin.
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: changes,
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
