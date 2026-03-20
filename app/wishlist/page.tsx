"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Product } from "@/types"

interface WishlistItem {
  id: string
  productId: string
  product: Product
}

export default function WishlistPage() {
  const { t } = useTranslations()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/wishlist")
      return
    }

    fetch("/api/wishlist")
      .then((res) => {
        if (res.ok) return res.json()
        return []
      })
      .then((data: WishlistItem[]) => setWishlistItems(data))
      .catch(() => setWishlistItems([]))
      .finally(() => setLoading(false))
  }, [user, router])

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      quantity: 1,
    })
    toast({ title: t("products.addedToCart"), description: item.product.name })
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" })
      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.productId !== productId))
        toast({ title: t("wishlist.removed"), description: t("wishlist.itemRemoved") })
      }
    } catch {
      // ignore
    }
  }

  if (!user || loading) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("wishlist.title")}</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">{t("wishlist.empty")}</h2>
          <p className="mt-2 text-muted-foreground">{t("wishlist.emptyMessage")}</p>
          <Button asChild className="mt-8">
            <Link href="/products">{t("wishlist.continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <Link href={`/products/${item.productId}`} className="relative block">
                <Image
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  width={300}
                  height={300}
                  className="aspect-square object-cover w-full transition-transform group-hover:scale-105"
                />
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-medium line-clamp-1 hover:underline">{item.product.name}</h3>
                </Link>
                <div className="mt-2 font-bold">${item.product.price.toFixed(2)}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="w-full" size="sm" onClick={() => handleAddToCart(item)}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t("products.addToCart")}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                >
                  <Trash className="w-4 h-4" />
                  <span className="sr-only">{t("wishlist.remove")}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
