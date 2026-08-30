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
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    },
    {
      id: "fashion",
      name: t("categories.fashion"),
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    },
    {
      id: "home",
      name: t("categories.home"),
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
    },
    {
      id: "beauty",
      name: t("categories.beauty"),
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    },
    {
      id: "books",
      name: t("categories.books"),
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    },
    {
      id: "toys",
      name: t("categories.toys"),
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
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
