"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import type { User } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/hooks/use-translations"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useTranslations()

  useEffect(() => {
    // Show cached user immediately for fast UI
    const cachedUser = localStorage.getItem("user")
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch {
        // ignore parse errors
      }
    }

    // Verify session with server (JWT in HttpOnly cookie)
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json()
        // Session invalid — clear local cache
        localStorage.removeItem("user")
        setUser(null)
        return null
      })
      .then((data: User | null) => {
        if (data) {
          setUser(data)
          localStorage.setItem("user", JSON.stringify(data))
        }
      })
      .catch(() => {
        localStorage.removeItem("user")
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return false

      const userData: User = await res.json()
      setUser(userData)
      // Cache public user info locally for fast UI (no sensitive data)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeBack", { name: userData.name }),
      })

      return true
    } catch {
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) return false

      const userData: User = await res.json()
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.accountCreated"),
      })

      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    // Fire and forget — server clears the HttpOnly cookie
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    setUser(null)
    localStorage.removeItem("user")

    toast({
      title: t("auth.logoutSuccess"),
      description: t("auth.loggedOut"),
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
