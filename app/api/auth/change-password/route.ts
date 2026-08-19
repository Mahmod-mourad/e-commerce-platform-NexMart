import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"

import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ValidationError, readJsonBody } from "@/lib/validation"

const BCRYPT_ROUNDS = 12

/**
 * Changes the signed-in user's password.
 *
 * The profile form used to do this in the browser: it read a "users" array out of
 * localStorage, compared the current password as plain text, and wrote the new one
 * back the same way. Nothing about that ever reached the server.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await readJsonBody(request)) as Record<string, unknown>

    const currentPassword = body.currentPassword
    const newPassword = body.newPassword

    if (typeof currentPassword !== "string" || currentPassword === "") {
      throw new ValidationError("currentPassword is required")
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw new ValidationError("newPassword must be at least 8 characters")
    }
    if (newPassword.length > 128) {
      throw new ValidationError("newPassword must be 128 characters or fewer")
    }
    if (newPassword === currentPassword) {
      throw new ValidationError("newPassword must be different from the current one")
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Requiring the current password means a stolen session cookie alone is not
    // enough to lock the real owner out of their account.
    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
