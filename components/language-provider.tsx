"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { translations } from "@/lib/translations"

type Locale = "en" | "ar"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, any>) => string
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: () => "",
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale)
      document.documentElement.lang = savedLocale
      document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr"
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr"
    router.refresh()
  }

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[locale]

    for (const k of keys) {
      if (!value[k]) {
        return key
      }
      value = value[k]
    }

    if (typeof value !== "string") {
      return key
    }

    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
      }, value as string)
    }

    return value
  }

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
}
