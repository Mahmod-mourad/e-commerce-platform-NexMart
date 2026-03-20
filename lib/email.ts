import nodemailer from "nodemailer"

async function createTransporter() {
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER || "smtp.ethereal.email",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || testAccount.user,
      pass: process.env.EMAIL_PASSWORD || testAccount.pass,
    },
  })
}

export async function sendOrderConfirmation(order: {
  id: string
  total: number
  createdAt: Date
  user: { name: string; email: string }
  items: { product: { name: string }; quantity: number; price: number }[]
  shippingDetails: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
}) {
  const transporter = await createTransporter()

  const itemsList = order.items
    .map((item) => `${item.product.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join("<br>")

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"AmaClone Store" <store@amaclone.com>',
    to: process.env.ADMIN_EMAIL!,
    cc: order.user.email,
    subject: `New Order #${order.id}`,
    html: `
      <h1>New Order Received</h1>
      <p>A new order has been placed by ${order.user.name}.</p>

      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${order.id}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>

      <h2>Items</h2>
      <p>${itemsList}</p>

      <h2>Shipping Information</h2>
      <p><strong>Name:</strong> ${order.shippingDetails.fullName}</p>
      <p><strong>Address:</strong> ${order.shippingDetails.address}</p>
      <p><strong>City:</strong> ${order.shippingDetails.city}</p>
      <p><strong>State:</strong> ${order.shippingDetails.state}</p>
      <p><strong>Zip Code:</strong> ${order.shippingDetails.zipCode}</p>
      <p><strong>Country:</strong> ${order.shippingDetails.country}</p>
      <p><strong>Phone:</strong> ${order.shippingDetails.phone}</p>

      <p>Thank you for your order!</p>
    `,
  })

  console.log("Message sent: %s", info.messageId)

  if (process.env.NODE_ENV !== "production") {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  }

  return info
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<void> {
  const transporter = await createTransporter()

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"AmaClone Store" <store@amaclone.com>',
    to: userEmail,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>Hello ${userName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#232f3e;color:#fff;text-decoration:none;border-radius:4px;">Reset Password</a></p>
      <p>This link will expire in 6 hours.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })

  if (process.env.NODE_ENV !== "production") {
    console.log("Password reset email preview: %s", nodemailer.getTestMessageUrl(info))
  }
}
