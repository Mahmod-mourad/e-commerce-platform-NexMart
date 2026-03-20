"use client"

import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/types"

interface OrderSummaryProps {
  items: CartItem[]
  total: number
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const { t } = useTranslations()

  const shipping: number = 0 // Free shipping
  const tax = total * 0.1 // 10% tax
  const grandTotal = total + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkout.orderSummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border">
                <Image
                  src={item.image || "/placeholder.svg?height=64&width=64"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between text-sm font-medium">
                  <h3 className="line-clamp-1">{item.name}</h3>
                  <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("checkout.quantity")}: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t("checkout.subtotal")}</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout.shipping")}</span>
            <span>{shipping === 0 ? t("checkout.free") : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout.tax")}</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>{t("checkout.total")}</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
