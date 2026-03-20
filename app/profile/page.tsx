"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProfileForm } from "@/components/profile-form"
import { OrderHistory } from "@/components/order-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/hooks/use-translations"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { t } = useTranslations()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/profile")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t("profile.personalInfo")}</TabsTrigger>
          <TabsTrigger value="orders">{t("profile.orderHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
