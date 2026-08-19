# NexMart — Full-Stack E-Commerce Platform

A fully-featured e-commerce web application inspired by Amazon, built with modern technologies and production-grade security practices.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + HttpOnly Cookies |
| Payments | Stripe |
| Email | Nodemailer |
| Testing | Jest + React Testing Library |

---

## Features

### Storefront
- Home page with hero section, featured products, categories, and deals
- Product listing with search, category filter, and pagination (max 100 per page)
- Product detail page with image gallery, reviews, and related products
- Dark / Light mode toggle
- Arabic / English language support (RTL-ready)

### Auth
- Register & Login with hashed passwords (bcrypt, 12 rounds)
- JWT stored in HttpOnly Secure cookie (7-day expiry)
- Forgot password & reset password via email token
- Protected routes via Next.js Middleware

### Shopping
- Cart (client-side with persistence)
- Wishlist (synced with database)
- Checkout form with shipping details
- Stripe payment integration
- Order confirmation email after successful purchase

### Security
- Server-side price calculation — client prices are never trusted
- Server-side payment amount calculation — Stripe amount computed from DB
- Mass-assignment protection on product create/update
- JWT verified from `lib/auth.ts` (single source of truth, no duplication)
- Middleware protects all sensitive routes (`/api/orders`, `/api/wishlist`, admin endpoints)
- Pagination DoS protection (limit capped at 100)
- Users can only access their own orders (IDOR protection)

### Admin
- Admin dashboard to create, update, and delete products
- Role-based access control (`admin` / `user`)
- Admin routes protected by both Middleware and route-level checks

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Home
│   ├── products/                 # Product listing & detail
│   ├── cart/                     # Cart page
│   ├── checkout/                 # Checkout page
│   ├── orders/                   # Order history & detail
│   ├── wishlist/                 # Wishlist
│   ├── profile/                  # User profile
│   ├── admin/products/           # Admin product management
│   ├── login/ | forgot-password/ | reset-password/
│   └── api/
│       ├── auth/                 # login, register, logout, me, forgot/reset-password
│       ├── products/             # CRUD products
│       ├── orders/               # Create & fetch orders
│       ├── wishlist/             # Add, fetch, remove wishlist items
│       └── payment/             # Stripe payment intent
├── components/                   # Reusable UI components
├── lib/
│   ├── auth.ts                   # JWT sign, verify, cookie helpers
│   ├── email.ts                  # Nodemailer email sender
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   ├── schema.prisma             # DB models
│   └── seed.ts                   # Sample data seed script
├── middleware.ts                 # Route protection
└── __tests__/                    # Unit & integration tests
```

---

## Getting Started

### The quick way

```bash
git clone https://github.com/Mahmod-mourad/e-commerce-platform-NexMart.git
cd e-commerce-platform-NexMart
docker compose up --build
```

That brings up PostgreSQL, applies the migrations, seeds a catalogue, and serves
the app on http://localhost:3000. Nothing else to configure — payments run
against Stripe test placeholders until you supply real keys.

Seeded accounts:

| Role | Email | Password |
|---|---|---|
| admin | `admin@nexmart.local` | `Password123!` |
| customer | `customer@nexmart.local` | `Password123!` |

### Running it directly

**Prerequisites:** Node.js 20+, PostgreSQL 14+, and a Stripe account if you want
real payments.

```bash
npm ci
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run seed
npm run dev
```

Every variable is documented inline in `.env.example`.

### Stripe webhooks

Orders stay `pending` until Stripe confirms the payment, and Stripe confirms it
by calling `/api/webhooks/stripe` — not the browser. For local development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`. Without it the
webhook rejects every request, which is the correct behaviour: an endpoint that
marks orders paid must not accept unsigned calls.

---

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm test           # Run tests
```

---

## Database Schema

```
User         — id, name, email, password, role, image
Product      — id, name, description, price, images[], category, brand, stock, rating, featured
Order        — id, userId, total, status, paymentMethod, shippingDetails (JSON)
OrderItem    — id, orderId, productId, quantity, price
Wishlist     — userId + productId (unique pair)
Review       — id, rating, comment, userId, productId
PasswordResetToken — token, userId, expiresAt
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| PATCH | `/api/auth/me` | Authenticated |
| POST | `/api/auth/change-password` | Authenticated |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| POST | `/api/products` | Admin |
| GET | `/api/products/:id` | Public |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/orders` | Authenticated (own orders only) |
| POST | `/api/orders` | Authenticated |
| GET | `/api/orders/:id` | Owner or admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/reviews?productId=` | Public |
| POST | `/api/reviews` | Verified purchasers only |

### Newsletter
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/newsletter` | Public |

### Wishlist
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/wishlist` | Authenticated |
| POST | `/api/wishlist` | Authenticated |
| DELETE | `/api/wishlist/:productId` | Authenticated |

### Payment
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/payment/create-intent` | Order owner |
| POST | `/api/webhooks/stripe` | Stripe (signature-verified) |

---

## License

MIT<img width="2880" height="1740" alt="image" src="https://github.com/user-attachments/assets/58fc1446-0fa4-48e7-bd53-b97c046d6632" />
<img width="2880" height="1740" alt="image" src="https://github.com/user-attachments/assets/0ae9f32e-2667-44f6-a99e-f55803b56277" />
<img width="2880" height="1740" alt="image" src="https://github.com/user-attachments/assets/cb9c7c76-22bc-4b8a-aec4-e4c7410bf3c5" />
<img width="2880" height="1740" alt="image" src="https://github.com/user-attachments/assets/cc06f538-7b59-418a-9d07-d0c8ed311320" />

