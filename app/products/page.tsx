import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Pagination } from "@/components/pagination"
import type { Product } from "@/types"

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return data.products ?? []
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <ProductFilters />
        </div>
        <div className="w-full md:w-3/4">
          <ProductGrid products={products} />
          <Pagination totalPages={5} currentPage={1} />
        </div>
      </div>
    </div>
  )
}
