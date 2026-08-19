import type { Order as PrismaOrder, OrderItem, Product as PrismaProduct, User as PrismaUser } from "@prisma/client"

/**
 * Types shared across the app.
 *
 * Anything that maps to a database table is derived from the Prisma client rather
 * than written out by hand. The hand-written versions had already drifted — the
 * schema has `brand String?`, which is `string | null`, while the interface said
 * `brand?: string`, so any row with a null brand failed to type-check.
 */

export type Product = PrismaProduct

export type User = Omit<PrismaUser, "password">

export interface ShippingDetails {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type Order = Omit<PrismaOrder, "shippingDetails"> & {
  shippingDetails: ShippingDetails
  items: (OrderItem & { product?: Product })[]
}

/** Cart lines live in browser storage, so this one is not a database shape. */
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}
