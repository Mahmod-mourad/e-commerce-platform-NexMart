import { Suspense } from "react"

import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Pagination } from "@/components/pagination"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

const PAGE_SIZE = 12

// The listing is driven by the query string and reads live stock, so there is
// nothing worth prerendering. Without this, the build tries to produce a static
// shell and fails on the useSearchParams inside the filter and pagination.
export const dynamic = "force-dynamic"

/**
 * Reads products straight from the database.
 *
 * This page used to fetch its own /api/products over HTTP using
 * NEXT_PUBLIC_APP_URL — a server component calling back into the same server,
 * which added a network round trip and broke whenever that variable was unset or
 * pointed somewhere else. Both paths share the same filter shape.
 */
async function getProducts(searchParams: {
  category?: string
  query?: string
  page?: string
}): Promise<{ products: Awaited<ReturnType<typeof prisma.product.findMany>>; totalPages: number; page: number }> {
  const page = Math.max(Number.parseInt(searchParams.page || "1", 10) || 1, 1)

  const where: Prisma.ProductWhereInput = {}
  if (searchParams.category) where.category = searchParams.category
  if (searchParams.query) {
    where.OR = [
      { name: { contains: searchParams.query, mode: "insensitive" } },
      { description: { contains: searchParams.query, mode: "insensitive" } },
    ]
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ])

  return { products, totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1), page }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string; page?: string }>
}) {
  const params = await searchParams
  const { products, totalPages, page } = await getProducts(params)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          {/* ProductFilters and Pagination both read the query string with
              useSearchParams, which forces a client-side bailout unless it happens
              inside a suspense boundary. */}
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
            <ProductFilters />
          </Suspense>
        </div>
        <div className="w-full md:w-3/4">
          <ProductGrid products={products} />
          <Suspense fallback={null}>
            {/* The page count comes from the real total, not a hardcoded 5. */}
            <Pagination totalPages={totalPages} currentPage={page} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
