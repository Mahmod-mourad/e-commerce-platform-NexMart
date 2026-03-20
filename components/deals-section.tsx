"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useState, useEffect } from "react"

export function DealsSection() {
  const { t } = useTranslations()
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newSeconds = prev.seconds - 1
        if (newSeconds >= 0) {
          return { ...prev, seconds: newSeconds }
        }

        const newMinutes = prev.minutes - 1
        if (newMinutes >= 0) {
          return { ...prev, minutes: newMinutes, seconds: 59 }
        }

        const newHours = prev.hours - 1
        if (newHours >= 0) {
          return { hours: newHours, minutes: 59, seconds: 59 }
        }

        // Reset timer when it reaches 0
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0")
  }

  const deals = [
    {
      id: "deal-1",
      name: "Wireless Noise-Cancelling Headphones",
      originalPrice: 299.99,
      salePrice: 199.99,
      discount: 33,
      image: "/placeholder.svg?height=300&width=300",
      category: "electronics",
    },
    {
      id: "deal-2",
      name: "Smart 4K Ultra HD TV",
      originalPrice: 899.99,
      salePrice: 649.99,
      discount: 28,
      image: "/placeholder.svg?height=300&width=300",
      category: "electronics",
    },
    {
      id: "deal-3",
      name: "Professional Kitchen Mixer",
      originalPrice: 449.99,
      salePrice: 349.99,
      discount: 22,
      image: "/placeholder.svg?height=300&width=300",
      category: "home",
    },
    {
      id: "deal-4",
      name: "Ergonomic Office Chair",
      originalPrice: 249.99,
      salePrice: 179.99,
      discount: 28,
      image: "/placeholder.svg?height=300&width=300",
      category: "home",
    },
  ]

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">{t("home.dealsOfTheDay")}</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <div className="text-sm font-medium">
            {t("home.endsIn")}:{" "}
            <span className="font-bold">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden group">
            <Link href={`/products/${deal.id}`} className="relative block">
              <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary">-{deal.discount}%</Badge>
              <Image
                src={deal.image || "/placeholder.svg"}
                alt={deal.name}
                width={300}
                height={300}
                className="aspect-square object-cover w-full transition-transform group-hover:scale-105"
              />
            </Link>
            <CardContent className="p-4">
              <Link href={`/products/${deal.id}`}>
                <h3 className="font-medium line-clamp-1 hover:underline">{deal.name}</h3>
              </Link>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold">${deal.salePrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${deal.originalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/products/${deal.id}`}>{t("home.viewDeal")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/products?deals=true">{t("home.viewAllDeals")}</Link>
        </Button>
      </div>
    </div>
  )
}
