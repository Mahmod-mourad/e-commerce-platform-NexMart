"use client"

import { useContext } from "react"
import { LanguageContext } from "@/components/language-provider"

export function useTranslations() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useTranslations must be used within a LanguageProvider")
  }

  return context
}
