"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent } from "@/components/ui/card"

export function BrandsSection() {
  const { t } = useTranslations()

  const brands = [
    {
      id: "brand-1",
      name: "TechMaster",
      image: "/placeholder.svg?height=100&width=100",
      category: "electronics",
    },
    {
      id: "brand-2",
      name: "FashionStyle",
      image: "/placeholder.svg?height=100&width=100",
      category: "fashion",
    },
    {
      id: "brand-3",
      name: "HomeComfort",
      image: "/placeholder.svg?height=100&width=100",
      category: "home",
    },
    {
      id: "brand-4",
      name: "BeautyGlow",
      image: "/placeholder.svg?height=100&width=100",
      category: "beauty",
    },
    {
      id: "brand-5",
      name: "BookWorm",
      image: "/placeholder.svg?height=100&width=100",
      category: "books",
    },
    {
      id: "brand-6",
      name: "ToyJoy",
      image: "/placeholder.svg?height=100&width=100",
      category: "toys",
    },
  ]

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("home.topBrands")}</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/products?brand=${brand.id}`}>
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full overflow-hidden bg-muted mb-3">
                  <Image
                    src={brand.image || "/placeholder.svg"}
                    alt={brand.name}
                    width={80}
                    height={80}
                    className="h-[80px] w-[80px] object-cover"
                  />
                </div>
                <h3 className="text-sm font-medium">{brand.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
