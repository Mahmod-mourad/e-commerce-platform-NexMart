"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Printer, Share } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Order } from "@/types"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { t } = useTranslations()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders/" + params.id)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)

        // In a real app, this would be an API call
        // For now, we'll just simulate fetching an order

        // Sample order
        const sampleOrder: Order = {
          id: params.id,
          userId: user.id,
          total: 349.98,
          status: "delivered",
          paymentMethod: "cash_on_delivery",
          shippingDetails: {
            fullName: user.name,
            email: user.email,
            phone: "123-456-7890",
            address: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345",
            country: "USA",
          },
          items: [
            {
              productId: "1",
              quantity: 1,
              price: 299.99,
            },
            {
              productId: "3",
              quantity: 1,
              price: 49.99,
            },
          ],
          createdAt: "2023-06-15T10:30:00Z",
        }

        setOrder(sampleOrder)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: t("orders.error"),
          description: t("orders.errorFetchingOrder"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, user, router, toast, t])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t("orders.pending")}</Badge>
      case "processing":
        return <Badge variant="secondary">{t("orders.processing")}</Badge>
      case "shipped":
        return <Badge variant="default">{t("orders.shipped")}</Badge>
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            {t("orders.delivered")}
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">{t("orders.cancelled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  // Sample products for the order items
  const products = [
    {
      id: "1",
      name: "Wireless Noise-Cancelling Headphones",
      price: 299.99,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      name: "Premium Leather Wallet",
      price: 49.99,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">{t("orders.back")}</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t("orders.orderDetails")}</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">{t("orders.orderSummary")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  {t("orders.print")}
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  {t("orders.share")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("orders.orderId")}: {order.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("orders.placed")}: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const product = products.find((p) => p.id === item.productId)
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={product?.image || "/placeholder.svg"}
                            alt={product?.name || "Product"}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium">
                            <h3>{product?.name || `Product #${item.productId}`}</h3>
                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t("orders.quantity")}: {item.quantity}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("orders.subtotal")}</span>
                    <span>${(order.total * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("orders.shipping")}</span>
                    <span>{t("orders.free")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("orders.tax")}</span>
                    <span>${(order.total * 0.1).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>{t("orders.total")}</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.shippingInformation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingDetails.fullName}</p>
                  <p>{order.shippingDetails.address}</p>
                  <p>
                    {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}
                  </p>
                  <p>{order.shippingDetails.country}</p>
                  <Separator className="my-2" />
                  <p>{order.shippingDetails.phone}</p>
                  <p>{order.shippingDetails.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("orders.paymentInformation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">
                    {order.paymentMethod === "cash_on_delivery" ? t("checkout.cashOnDelivery") : order.paymentMethod}
                  </p>
                  <p className="text-muted-foreground">
                    {t("orders.paymentStatus")}: {t("orders.paid")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("orders.backToOrders")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                {t("orders.continueShopping")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
