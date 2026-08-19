# Security notes

What this application defends against, how, and where the tests are.

## The client never decides what anything costs

Every price comes from the database row at the moment of the request. The cart
sent by the browser contributes product ids and quantities and nothing else.

`POST /api/orders` looks each product up and computes the total from stored
prices. `POST /api/payment/create-intent` does not take a cart at all — it reads
the order that already exists and charges its recorded total, so the amount
charged and the amount owed cannot drift apart.

A request carrying its own `total`, or a `prices` map, is ignored rather than
trusted. Covered by *"prices the order from the database, not the request"* in
`__tests__/api/orders.test.ts`.

## Quantities are validated before they reach arithmetic

A negative quantity flows into `price * quantity` and produces a negative line
total, which lowers the order value. `parseCartItems` rejects anything that is
not a whole number of at least 1, caps a single line at 99 units and an order at
50 lines, and rejects the same product appearing twice — two lines for one
product would decrement stock twice against a single availability check.

## Stock cannot go negative, and two buyers cannot take the last unit

Order creation runs inside one transaction. Stock is decremented with a
conditional update:

```ts
await tx.product.updateMany({
  where: { id: line.productId, stock: { gte: line.quantity } },
  data: { stock: { decrement: line.quantity } },
})
```

The `stock: { gte: quantity }` in the where clause is the guard. Two orders
racing for the last unit cannot both match: the second one updates zero rows,
which throws and rolls the whole transaction back. Checking stock and then
decrementing in two statements would let both through.

## Payment is confirmed by Stripe, not by the browser

An order is created `pending` and stays there until Stripe calls
`/api/webhooks/stripe` with a `payment_intent.succeeded` event whose signature
verifies against `STRIPE_WEBHOOK_SECRET`. Nothing the client sends can move an
order to `paid`.

This matters because the browser can lie, and because a customer can also simply
close the tab after paying — a client-side confirmation would lose the payment.

The handler is idempotent. Stripe delivers at least once and retries on any
non-2xx, so the update is scoped to orders that are still `pending`; a repeat
delivery matches nothing and changes nothing.

A failed payment releases the stock it was holding and marks the order
`payment_failed`, in a transaction, so nothing stays reserved against an order
nobody will pay for.

## Authorisation is enforced per record, not per route

Reads are scoped by owner in the query itself rather than fetched and then
checked:

- `GET /api/orders` filters by the authenticated user id. The `userId` query
  parameter is only honoured when it matches, otherwise 403.
- `GET /api/orders/:id` matches on `{ id, userId }` for ordinary users. A
  missing match returns **404, not 403** — telling someone an order exists but
  is not theirs confirms the id is real.
- Reviews and profile updates are scoped the same way.

Admin-only writes on `/api/products` are enforced in `middleware.ts` before the
handler runs.

## Reviews require a purchase

`POST /api/reviews` checks for an `OrderItem` belonging to a **paid** order of
the signed-in user for that product. Without it, any account could rate any
product, which is the usual way review scores get gamed. One review per person
per product.

## Passwords

bcrypt at cost 12, hashed server-side. `POST /api/auth/change-password` requires
the current password, so a stolen session cookie alone cannot lock the real
owner out.

Tokens are JWTs in `HttpOnly` cookies, which keeps them out of reach of
JavaScript and therefore out of reach of XSS.

## What is deliberately not editable

`PATCH /api/auth/me` accepts a name and an image. It does not accept `role` —
accepting it would let anyone make themselves an admin with one request — and it
does not accept `email`, which is the login identifier and would need a
verification flow to change safely.

## Known gaps

Stated rather than hidden:

- **No rate limiting.** Login and registration will take as many attempts as you
  care to send. In production this belongs at the edge — a WAF or the hosting
  platform — rather than in application code.
- **No CSRF tokens.** The auth cookie is `SameSite=Lax`, which stops the common
  cross-site form post, but a dedicated token would be stronger.
- **Email delivery is best-effort.** A failed confirmation email is logged and
  the order still succeeds. There is no retry queue.
- **Product images are arbitrary URLs.** They are rendered unoptimised and are
  not fetched or validated server-side.
