"use client"

import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/components/cart-item"
import { CartSummary } from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { t } = useTranslations()
  const { items, total, isEmpty } = useCart()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">{t("cart.empty")}</h2>
        <p className="mt-2 text-muted-foreground">{t("cart.emptyMessage")}</p>
        <Button asChild className="mt-8">
          <Link href="/products">{t("cart.continueShopping")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("cart.title")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div>
          <CartSummary total={total} />
        </div>
      </div>
    </div>
  )
}
