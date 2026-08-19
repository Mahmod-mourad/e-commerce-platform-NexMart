/**
 * Request-body checks shared by the API routes.
 *
 * These exist because several routes read `await request.json()` and indexed
 * straight into it. A missing or malformed body threw, which the catch block
 * turned into a 500 — the client was told the server broke when it was the
 * request that was wrong.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export interface CartItemInput {
  id: string
  quantity: number
}

export interface ShippingDetails {
  fullName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  notes?: string
}

const MAX_QUANTITY_PER_ITEM = 99
const MAX_ITEMS_PER_ORDER = 50

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireString(value: unknown, field: string, maxLength = 200): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} is required`)
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} must be ${maxLength} characters or fewer`)
  }
  return value.trim()
}

/**
 * Validates the cart an order or payment intent is built from.
 *
 * Quantity is the one that matters most: a negative quantity used to flow
 * straight into `price * quantity`, which would have produced a negative line
 * total and an order that reduced the bill.
 */
export function parseCartItems(value: unknown): CartItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError("items must be a non-empty array")
  }

  if (value.length > MAX_ITEMS_PER_ORDER) {
    throw new ValidationError(`an order cannot contain more than ${MAX_ITEMS_PER_ORDER} line items`)
  }

  const seen = new Set<string>()

  return value.map((raw) => {
    if (!isObject(raw)) {
      throw new ValidationError("each item must be an object")
    }

    const id = requireString(raw.id, "item id", 64)

    if (seen.has(id)) {
      throw new ValidationError(`item ${id} appears more than once`)
    }
    seen.add(id)

    const quantity = raw.quantity
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError(`quantity for item ${id} must be a whole number of at least 1`)
    }
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      throw new ValidationError(`quantity for item ${id} cannot exceed ${MAX_QUANTITY_PER_ITEM}`)
    }

    return { id, quantity }
  })
}

/** The shipping address is stored as JSON, so it has to be checked on the way in. */
export function parseShippingDetails(value: unknown): ShippingDetails {
  if (!isObject(value)) {
    throw new ValidationError("shippingDetails is required")
  }

  return {
    fullName: requireString(value.fullName, "fullName", 100),
    email: requireString(value.email, "email", 200),
    address: requireString(value.address, "address", 200),
    city: requireString(value.city, "city", 100),
    state: requireString(value.state, "state", 100),
    zipCode: requireString(value.zipCode, "zipCode", 20),
    country: requireString(value.country, "country", 100),
    phone: requireString(value.phone, "phone", 30),
    // Optional: the checkout form offers a delivery note.
    ...(typeof value.notes === "string" && value.notes.trim() !== ""
      ? { notes: value.notes.trim().slice(0, 500) }
      : {}),
  }
}

// These are the values the checkout form submits.
const PAYMENT_METHODS = ["credit_card", "cash_on_delivery"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export function parsePaymentMethod(value: unknown): PaymentMethod {
  if (typeof value !== "string" || !PAYMENT_METHODS.includes(value as PaymentMethod)) {
    throw new ValidationError(`paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`)
  }
  return value as PaymentMethod
}

/** Reads and parses a JSON body, turning malformed JSON into a ValidationError. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError("request body must be valid JSON")
  }
}
