"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { t } = useTranslations()
  const { updateItemQuantity, removeItem } = useCart()

  const incrementQuantity = () => {
    updateItemQuantity(item.id, item.quantity + 1)
  }

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1)
    }
  }

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.image || "/placeholder.svg?height=100&width=100"}
          alt={item.name}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium">
          <Link href={`/products/${item.id}`} className="hover:underline">
            <h3>{item.name}</h3>
          </Link>
          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decrementQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">{t("cart.decreaseQuantity")}</span>
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementQuantity}>
              <Plus className="h-3 w-3" />
              <span className="sr-only">{t("cart.increaseQuantity")}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash className="h-4 w-4 mr-1" />
            {t("cart.remove")}
          </Button>
        </div>
      </div>
    </div>
  )
}
