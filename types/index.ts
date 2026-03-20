export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  rating: number
  stock: number
  featured: boolean
  brand?: string
  model?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
  image?: string
}

export interface Order {
  id: string
  userId: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "cash_on_delivery" | "credit_card" | "paypal"
  shippingDetails: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  createdAt: string
}
