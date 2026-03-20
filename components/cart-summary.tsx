"use client"

import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface CartSummaryProps {
  total: number
}

export function CartSummary({ total }: CartSummaryProps) {
  const { t } = useTranslations()

  const shipping: number = 0 // Free shipping
  const tax = total * 0.1 // 10% tax
  const grandTotal = total + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cart.orderSummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>{t("cart.subtotal")}</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("cart.shipping")}</span>
          <span>{shipping === 0 ? t("cart.free") : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("cart.tax")}</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>{t("cart.total")}</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/checkout">{t("cart.checkout")}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
