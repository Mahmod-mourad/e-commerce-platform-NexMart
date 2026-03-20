"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/types"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { t } = useTranslations()
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    })

    toast({
      title: t("products.addedToCart"),
      description: product.name,
    })
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">{t("products.noProductsFound")}</h3>
        <p className="text-muted-foreground mt-2">{t("products.tryDifferentFilters")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden group">
          <Link href={`/products/${product.id}`} className="relative block">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="aspect-square object-cover w-full transition-transform group-hover:scale-105"
            />
            {product.stock < 5 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                {t("products.lowStock")}
              </Badge>
            )}
          </Link>
          <CardContent className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium line-clamp-1 hover:underline">{product.name}</h3>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating})</span>
            </div>
            <div className="mt-2 font-bold">${product.price.toFixed(2)}</div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button className="w-full" size="sm" onClick={() => handleAddToCart(product)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t("products.addToCart")}
            </Button>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Heart className="w-4 h-4" />
              <span className="sr-only">{t("products.addToWishlist")}</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
