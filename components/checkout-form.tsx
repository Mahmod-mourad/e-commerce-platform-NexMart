"use client"

import type React from "react"
import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
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

interface CheckoutFormProps {
  onSubmit: (data: FormData, stripePaymentIntentId?: string) => void
  isSubmitting: boolean
  total: number
}

export function CheckoutForm({ onSubmit, isSubmitting, total }: CheckoutFormProps) {
  const { t } = useTranslations()
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "cash_on_delivery",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
    setCardError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.paymentMethod === "credit_card") {
      if (!stripe || !elements) return

      setCardError(null)
      setProcessingPayment(true)

      try {
        // Create payment intent on server
        const intentRes = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        })

        if (!intentRes.ok) {
          setCardError("Failed to initialize payment. Please try again.")
          return
        }

        const { client_secret } = await intentRes.json()

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          setCardError("Card element not found.")
          return
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
          payment_method: { card: cardElement },
        })

        if (error) {
          setCardError(error.message || "Payment failed. Please check your card details.")
          return
        }

        if (paymentIntent?.status === "succeeded") {
          onSubmit(formData, paymentIntent.id)
        }
      } finally {
        setProcessingPayment(false)
      }
    } else {
      onSubmit(formData)
    }
  }

  const isLoading = isSubmitting || processingPayment

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.shippingInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("checkout.email")}</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("checkout.phone")}</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("checkout.address")}</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("checkout.city")}</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t("checkout.state")}</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t("checkout.zipCode")}</Label>
                <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t("checkout.country")}</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("checkout.paymentMethod")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formData.paymentMethod} onValueChange={handleRadioChange} className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
              <Label htmlFor="cash_on_delivery">{t("checkout.cashOnDelivery")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card">{t("checkout.creditCard") || "Credit Card"}</Label>
            </div>
          </RadioGroup>

          {formData.paymentMethod === "credit_card" && (
            <div className="mt-4 p-4 border rounded-md bg-muted/30">
              <Label className="text-sm font-medium mb-2 block">Card Details</Label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": { color: "#aab7c4" },
                    },
                    invalid: { color: "#9e2146" },
                  },
                }}
              />
              {cardError && <p className="mt-2 text-sm text-destructive">{cardError}</p>}
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Label htmlFor="notes">{t("checkout.orderNotes")}</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder={t("checkout.notesPlaceholder")}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full mt-6" disabled={isLoading}>
        {isLoading ? t("checkout.processing") : t("checkout.placeOrder")}
      </Button>
    </form>
  )
}
