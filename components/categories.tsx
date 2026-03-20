"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent } from "@/components/ui/card"

export function Categories() {
  const { t } = useTranslations()

  const categories = [
    {
      id: "electronics",
      name: t("categories.electronics"),
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "fashion",
      name: t("categories.fashion"),
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "home",
      name: t("categories.home"),
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "beauty",
      name: t("categories.beauty"),
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "books",
      name: t("categories.books"),
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "toys",
      name: t("categories.toys"),
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("home.shopByCategory")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.id}`}>
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full overflow-hidden bg-muted mb-3">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={100}
                    height={100}
                    className="h-[100px] w-[100px] object-cover"
                  />
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
