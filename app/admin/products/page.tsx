"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProductForm } from "@/components/product-form"
import { ProductList } from "@/components/product-list"
import { useTranslations } from "@/hooks/use-translations"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminProductsPage() {
  const { t } = useTranslations()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login?redirect=/admin/products")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("admin.products.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProductForm />
        </div>
        <div className="lg:col-span-2">
          <ProductList />
        </div>
      </div>
    </div>
  )
}
