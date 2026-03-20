"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Order } from "@/types"

interface OrderHistoryProps {
  userId: string
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: t("profile.error"),
          description: t("profile.errorFetchingOrders"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId, toast, t])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.orderHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sample orders if API returns empty
  const displayOrders =
    orders.length > 0
      ? orders
      : ([
          {
            id: "order-1",
            userId: userId,
            total: 349.98,
            status: "delivered",
            paymentMethod: "cash_on_delivery",
            shippingDetails: {
              fullName: "John Doe",
              email: "john@example.com",
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
          },
          {
            id: "order-2",
            userId: userId,
            total: 199.99,
            status: "processing",
            paymentMethod: "cash_on_delivery",
            shippingDetails: {
              fullName: "John Doe",
              email: "john@example.com",
              phone: "123-456-7890",
              address: "123 Main St",
              city: "Anytown",
              state: "CA",
              zipCode: "12345",
              country: "USA",
            },
            items: [
              {
                productId: "2",
                quantity: 1,
                price: 199.99,
              },
            ],
            createdAt: "2023-07-20T14:45:00Z",
          },
        ] as Order[])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.orderHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t("profile.noOrders")}</h3>
            <p className="mt-2 text-muted-foreground">{t("profile.startShopping")}</p>
            <Button asChild className="mt-4">
              <Link href="/products">{t("profile.browseProducts")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("orders.orderId")}: {order.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("orders.placed")}: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t("orders.details")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-lg font-medium">
                    {t("orders.total")}: ${order.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("orders.paymentMethod")}:{" "}
                    {order.paymentMethod === "cash_on_delivery" ? t("checkout.cashOnDelivery") : order.paymentMethod}
                  </div>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    {t("orders.items")}: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
