import {
  ValidationError,
  parseCartItems,
  parsePaymentMethod,
  parseShippingDetails,
} from "@/lib/validation"

describe("parseCartItems", () => {
  it("accepts a well-formed cart", () => {
    expect(parseCartItems([{ id: "p1", quantity: 2 }])).toEqual([{ id: "p1", quantity: 2 }])
  })

  it("rejects a negative quantity", () => {
    // This is the one that mattered: a negative quantity used to flow into
    // `price * quantity` and produce a line total that reduced the bill.
    expect(() => parseCartItems([{ id: "p1", quantity: -5 }])).toThrow(ValidationError)
  })

  it("rejects a zero quantity", () => {
    expect(() => parseCartItems([{ id: "p1", quantity: 0 }])).toThrow(ValidationError)
  })

  it("rejects a fractional quantity", () => {
    expect(() => parseCartItems([{ id: "p1", quantity: 1.5 }])).toThrow(ValidationError)
  })

  it("rejects a quantity that is not a number", () => {
    expect(() => parseCartItems([{ id: "p1", quantity: "2" }])).toThrow(ValidationError)
  })

  it("rejects an empty cart", () => {
    expect(() => parseCartItems([])).toThrow(ValidationError)
  })

  it("rejects a missing cart", () => {
    expect(() => parseCartItems(undefined)).toThrow(ValidationError)
  })

  it("rejects the same product twice", () => {
    // Two lines for one product would decrement stock twice against one check.
    expect(() =>
      parseCartItems([
        { id: "p1", quantity: 1 },
        { id: "p1", quantity: 1 },
      ]),
    ).toThrow(ValidationError)
  })

  it("caps how much of one item can be ordered", () => {
    expect(() => parseCartItems([{ id: "p1", quantity: 100 }])).toThrow(ValidationError)
  })

  it("caps how many line items an order can have", () => {
    const items = Array.from({ length: 51 }, (_, i) => ({ id: `p${i}`, quantity: 1 }))
    expect(() => parseCartItems(items)).toThrow(ValidationError)
  })
})

describe("parseShippingDetails", () => {
  const valid = {
    fullName: "Nour Hassan",
    email: "nour@example.com",
    address: "12 Nile St",
    city: "Cairo",
    state: "Cairo",
    zipCode: "11511",
    country: "Egypt",
    phone: "+201234567890",
  }

  it("accepts a complete address", () => {
    expect(parseShippingDetails(valid)).toEqual(valid)
  })

  it("trims surrounding whitespace", () => {
    expect(parseShippingDetails({ ...valid, city: "  Cairo  " }).city).toBe("Cairo")
  })

  it("rejects a missing field", () => {
    const { city, ...incomplete } = valid
    expect(() => parseShippingDetails(incomplete)).toThrow(ValidationError)
  })

  it("rejects a blank field", () => {
    expect(() => parseShippingDetails({ ...valid, address: "   " })).toThrow(ValidationError)
  })

  it("rejects an over-long field", () => {
    // The address is stored as JSON, so nothing else bounds its length.
    expect(() => parseShippingDetails({ ...valid, city: "x".repeat(101) })).toThrow(ValidationError)
  })

  it("rejects a non-object", () => {
    expect(() => parseShippingDetails("Cairo")).toThrow(ValidationError)
  })
})

describe("parsePaymentMethod", () => {
  it("accepts the supported methods", () => {
    expect(parsePaymentMethod("credit_card")).toBe("credit_card")
    expect(parsePaymentMethod("cash_on_delivery")).toBe("cash_on_delivery")
  })

  it("rejects anything else", () => {
    expect(() => parsePaymentMethod("bitcoin")).toThrow(ValidationError)
    expect(() => parsePaymentMethod(undefined)).toThrow(ValidationError)
  })
})
