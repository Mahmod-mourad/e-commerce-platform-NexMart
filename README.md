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

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Stripe account (for payments)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nexmart.git
cd nexmart
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nexmart"
JWT_SECRET="your-random-secret-min-32-chars"

# Email (Gmail example)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nexmart.com
ADMIN_EMAIL=admin@nexmart.com

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Seed sample products (optional)

```bash
npx tsx prisma/seed.ts
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
| GET | `/api/orders` | Authenticated |
| POST | `/api/orders` | Authenticated |

### Wishlist
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/wishlist` | Authenticated |
| POST | `/api/wishlist` | Authenticated |
| DELETE | `/api/wishlist/:productId` | Authenticated |

### Payment
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/payment/create-intent` | Authenticated |

---

## License

MIT
