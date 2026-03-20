"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useCart } from "@/hooks/use-cart"
import { CheckoutForm } from "@/components/checkout-form"
import { OrderSummary } from "@/components/order-summary"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  paymentMethod: string
  notes: string
}

export default function CheckoutPage() {
  const { t } = useTranslations()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = async (formData: CheckoutData, stripePaymentIntentId?: string) => {
    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          shippingDetails: formData,
          paymentMethod: formData.paymentMethod,
          stripePaymentIntentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const order = await response.json()
      clearCart()
      router.push(`/orders/${order.id}`)

      toast({
        title: t("checkout.success"),
        description: t("checkout.successMessage"),
      })
    } catch {
      toast({
        title: t("checkout.error"),
        description: t("checkout.errorMessage"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("checkout.title")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Elements stripe={stripePromise}>
          <CheckoutForm onSubmit={handleCheckout} isSubmitting={isSubmitting} total={total} />
        </Elements>
        <OrderSummary items={items} total={total} />
      </div>
    </div>
  )
}
