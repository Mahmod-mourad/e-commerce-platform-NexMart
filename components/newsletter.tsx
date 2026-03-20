"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Mail } from "lucide-react"

export function Newsletter() {
  const { t } = useTranslations()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: t("newsletter.error"),
        description: t("newsletter.enterEmail"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate subscribing

      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("newsletter.success"),
        description: t("newsletter.subscribed"),
      })

      setEmail("")
    } catch (error) {
      toast({
        title: t("newsletter.error"),
        description: t("newsletter.errorSubscribing"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-muted/50 border-none">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Mail className="h-8 w-8 text-primary mx-auto md:mx-0 mb-2" />
            <h3 className="text-xl font-bold">{t("newsletter.title")}</h3>
            <p className="text-muted-foreground mt-1">{t("newsletter.description")}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("newsletter.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("newsletter.subscribing") : t("newsletter.subscribe")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("newsletter.privacy")}</p>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
