"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { useTranslations } from "@/hooks/use-translations"
import { useSearchParams, useRouter } from "next/navigation"

export default function LoginPage() {
  const { t } = useTranslations()
  const [mode, setMode] = useState<"login" | "register">("login")
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const router = useRouter()
  const { login, register } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password)
    if (success) {
      router.push(redirect)
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    const success = await register(name, email, password)
    if (success) {
      router.push(redirect)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-card rounded-lg shadow-lg p-6 border">
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 w-full">
            <button
              className={`py-2 text-center ${
                mode === "login" ? "bg-primary text-primary-foreground" : "bg-muted"
              } rounded-l-md`}
              onClick={() => setMode("login")}
            >
              {t("auth.login")}
            </button>
            <button
              className={`py-2 text-center ${
                mode === "register" ? "bg-primary text-primary-foreground" : "bg-muted"
              } rounded-r-md`}
              onClick={() => setMode("register")}
            >
              {t("auth.register")}
            </button>
          </div>
        </div>

        {mode === "login" ? <LoginForm onSubmit={handleLogin} /> : <RegisterForm onSubmit={handleRegister} />}
      </div>
    </div>
  )
}
