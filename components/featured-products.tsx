"use client"

import { useEffect, useState } from "react"
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

export function FeaturedProducts() {
  const { t } = useTranslations()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?featured=true")
        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{t("home.featuredProducts")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
              <CardFooter className="p-4">
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Fallback to sample products if API returns empty
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: "1",
            name: "Wireless Noise-Cancelling Headphones",
            description: "Premium wireless headphones with active noise cancellation",
            price: 299.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "electronics",
            rating: 4.5,
            stock: 15,
            featured: true,
          },
          {
            id: "2",
            name: "Smart Fitness Watch",
            description: "Track your fitness goals with this advanced smartwatch",
            price: 199.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "electronics",
            rating: 4.3,
            stock: 20,
            featured: true,
          },
          {
            id: "3",
            name: "Organic Cotton T-Shirt",
            description: "Comfortable and eco-friendly cotton t-shirt",
            price: 29.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "fashion",
            rating: 4.0,
            stock: 50,
            featured: true,
          },
          {
            id: "4",
            name: "Professional Blender",
            description: "High-performance blender for smoothies and food preparation",
            price: 149.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "home",
            rating: 4.7,
            stock: 10,
            featured: true,
          },
        ]

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("home.featuredProducts")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
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
      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/products">{t("home.viewAllProducts")}</Link>
        </Button>
      </div>
    </div>
  )
}
