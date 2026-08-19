import Stripe from "stripe"

/**
 * Lazily constructs the Stripe client.
 *
 * Building this at module scope meant the constructor ran while Next collected
 * page data at build time, and Stripe throws when the key is missing — so
 * `next build` failed on any machine without STRIPE_SECRET_KEY, CI included.
 * Creating it on first use keeps the build independent of runtime secrets.
 */
let client: Stripe | null = null

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY

    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }

    client = new Stripe(key)
  }

  return client
}
