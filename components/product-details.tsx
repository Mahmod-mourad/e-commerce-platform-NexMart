"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Minus, Plus, Share, ShoppingCart, Star, Truck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { t } = useTranslations()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { productId: string }[]) => {
        setInWishlist(data.some((item) => item.productId === product.id))
      })
      .catch(() => {})
  }, [user, product.id])

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
    })
    toast({ title: t("products.addedToCart"), description: product.name })
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        title: t("auth.loginRequired") || "Login required",
        description: t("auth.loginToWishlist") || "Please login to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" })
        if (res.ok) {
          setInWishlist(false)
          toast({ title: t("wishlist.removed"), description: product.name })
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        if (res.ok) {
          setInWishlist(true)
          toast({ title: t("products.addedToWishlist") || "Added to wishlist", description: product.name })
        }
      }
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                selectedImage === index ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.rating}) · {Math.floor(Math.random() * 500)} {t("products.reviews")}
            </span>
          </div>
        </div>

        <div className="text-3xl font-bold">${product.price.toFixed(2)}</div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
              {product.stock > 0 ? t("products.inStock") : t("products.outOfStock")}
            </Badge>
            {product.stock < 5 && product.stock > 0 && (
              <span className="text-sm text-red-500">{t("products.onlyLeft", { count: product.stock })}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            {t("products.freeDelivery")}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
              <span className="sr-only">{t("products.decreaseQuantity")}</span>
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= product.stock}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t("products.increaseQuantity")}</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {t("products.addToCart")}
            </Button>
            <Button
              variant={inWishlist ? "default" : "outline"}
              className="flex-1"
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
            >
              <Heart className={`h-5 w-5 mr-2 ${inWishlist ? "fill-current" : ""}`} />
              {inWishlist ? t("wishlist.remove") || "Remove from Wishlist" : t("products.addToWishlist")}
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-5 w-5" />
              <span className="sr-only">{t("products.share")}</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="description">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              {t("products.description")}
            </TabsTrigger>
            <TabsTrigger value="specifications" className="flex-1">
              {t("products.specifications")}
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1">
              {t("products.shipping")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-sm mt-4">
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="text-sm mt-4">
            <ul className="space-y-2">
              <li>
                <strong>{t("products.category")}:</strong> {product.category}
              </li>
              <li>
                <strong>{t("products.brand")}:</strong> {product.brand || "Generic"}
              </li>
              <li>
                <strong>{t("products.model")}:</strong> {product.model || "Standard"}
              </li>
              <li>
                <strong>{t("products.warranty")}:</strong> 1 {t("products.year")}
              </li>
            </ul>
          </TabsContent>
          <TabsContent value="shipping" className="text-sm mt-4">
            <p>{t("products.shippingInfo")}</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
