import { ProductDetails } from "@/components/product-details"
import { RelatedProducts } from "@/components/related-products"
import { ProductReviews } from "@/components/product-reviews"
import { notFound } from "next/navigation"
import type { Product } from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/products/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getRelatedProducts(category: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/products?category=${encodeURIComponent(category)}`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.products ?? []
  } catch {
    return []
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category)

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
      <ProductReviews productId={params.id} />
      <RelatedProducts products={relatedProducts} />
    </div>
  )
}
