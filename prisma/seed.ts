import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Demo accounts for local development. These are ordinary rows with real bcrypt
 * hashes — the API treats them exactly like any other account.
 */
const DEMO_PASSWORD = "Password123!"

const DEMO_USERS = [
  { name: "Admin User", email: "admin@nexmart.local", role: "admin" },
  { name: "Nour Hassan", email: "customer@nexmart.local", role: "user" },
  { name: "Ahmed Samir", email: "ahmed@nexmart.local", role: "user" },
  { name: "Sara Mostafa", email: "sara@nexmart.local", role: "user" },
  { name: "Omar Khaled", email: "omar@nexmart.local", role: "user" },
  { name: "Laila Adel", email: "laila@nexmart.local", role: "user" },
]

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600`

/**
 * The catalogue. Categories use the lowercase ids the storefront filters on,
 * and every image was verified to resolve — a catalogue full of broken image
 * placeholders looked worse than an honest, smaller one.
 */
const PRODUCTS = [
  // --- Electronics ---
  {
    name: "Apple MacBook Pro 14-inch M3",
    description: "لابتوب احترافي بشريحة M3 مع شاشة Liquid Retina XDR وبطارية تدوم 18 ساعة.",
    price: 1999.99,
    images: [img("1517336714731-489689fd1ca8")],
    category: "electronics",
    brand: "Apple",
    model: "MacBook Pro 14 M3",
    stock: 15,
    featured: true,
    rating: 4.9,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "هاتف ذكي متطور مع كاميرا 200MP وقلم S Pen مدمج وشاشة Dynamic AMOLED 2X.",
    price: 1299.99,
    images: [img("1610945415295-d9bbf067e59c")],
    category: "electronics",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    stock: 30,
    featured: true,
    rating: 4.8,
  },
  {
    name: "Sony WH-1000XM5",
    description: "سماعات لاسلكية بأفضل تقنية إلغاء ضوضاء في السوق مع صوت Hi-Res Audio.",
    price: 349.99,
    images: [img("1505740420928-5e560c06d30e")],
    category: "electronics",
    brand: "Sony",
    model: "WH-1000XM5",
    stock: 50,
    featured: false,
    rating: 4.7,
  },
  {
    name: "Apple iPad Pro 12.9-inch M2",
    description: "تابلت احترافي بشريحة M2 وشاشة Liquid Retina XDR مع دعم Apple Pencil Pro.",
    price: 1099.99,
    images: [img("1544244015-0df4b3ffc6b0")],
    category: "electronics",
    brand: "Apple",
    model: "iPad Pro 12.9 M2",
    stock: 25,
    featured: true,
    rating: 4.9,
  },
  {
    name: "Canon EOS R6 Mark II",
    description: "كاميرا mirrorless احترافية بسرعة 40fps وتثبيت صورة متطور لتصوير مثالي.",
    price: 2499.99,
    images: [img("1516035069371-29a1b244cc32")],
    category: "electronics",
    brand: "Canon",
    model: "EOS R6 Mark II",
    stock: 10,
    featured: true,
    rating: 4.9,
  },
  {
    name: "Sony PlayStation 5 Console",
    description: "أحدث جيل من PlayStation بمعالج قوي وSSD فائق السرعة لتجربة ألعاب لا تُنسى.",
    price: 499.99,
    images: [img("1606813907291-d86efa9b94db")],
    category: "electronics",
    brand: "Sony",
    model: "PS5",
    stock: 8,
    featured: true,
    rating: 4.8,
  },
  {
    name: "Apple Watch Series 9",
    description: "ساعة ذكية بشاشة دائماً مضيئة وتتبع دقيق لللياقة مع استشعارات القلب والأكسجين.",
    price: 429.99,
    images: [img("1546868871-7041f2a55e12")],
    category: "electronics",
    brand: "Apple",
    model: "Watch Series 9",
    stock: 35,
    featured: false,
    rating: 4.7,
  },
  {
    name: "Smart Watch Lite",
    description: "ساعة ذكية خفيفة بتتبع اللياقة والنوم وبطارية تدوم أسبوع كامل بشحنة واحدة.",
    price: 129.99,
    images: [img("1523275335684-37898b6baf30")],
    category: "electronics",
    brand: "FitTrack",
    model: "SW-2",
    stock: 60,
    featured: false,
    rating: 4.3,
  },
  {
    name: "Sony WH-CH520 Headphones",
    description: "سماعات سلكية مريحة بصوت متوازن وتصميم قابل للطي للاستخدام اليومي.",
    price: 79.99,
    images: [img("1583394838336-acd977736f90")],
    category: "electronics",
    brand: "Sony",
    model: "WH-CH520",
    stock: 45,
    featured: false,
    rating: 4.4,
  },
  // --- Fashion ---
  {
    name: "Nike Air Max 270",
    description: "حذاء رياضي مريح مع وسادة هوائية Max Air لأقصى راحة طوال اليوم.",
    price: 149.99,
    images: [img("1542291026-7eec264c27ff")],
    category: "fashion",
    brand: "Nike",
    model: "Air Max 270",
    stock: 100,
    featured: true,
    rating: 4.6,
  },
  {
    name: "Adidas Ultraboost 23",
    description: "حذاء جري بتقنية Boost للحصول على أقصى طاقة إرجاع مع كل خطوة.",
    price: 189.99,
    images: [img("1608231387042-66d1773070a5")],
    category: "fashion",
    brand: "Adidas",
    model: "Ultraboost 23",
    stock: 80,
    featured: false,
    rating: 4.5,
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "جينز كلاسيكي بقصة مستقيمة، الأيقونة الأزلية في عالم الموضة منذ 1873.",
    price: 69.99,
    images: [img("1542272604-787c3835535d")],
    category: "fashion",
    brand: "Levi's",
    model: "501 Original",
    stock: 200,
    featured: false,
    rating: 4.6,
  },
  {
    name: "Nike Field General Sneakers",
    description: "حذاء كاجوال بتصميم تراثي وجلد طبيعي فاخر يناسب الإطلالات اليومية.",
    price: 119.99,
    images: [img("1549298916-b41d501d3772")],
    category: "fashion",
    brand: "Nike",
    model: "Field General",
    stock: 70,
    featured: false,
    rating: 4.6,
  },
  {
    name: "Men's Bomber Jacket",
    description: "جاكيت بومبر خفيف مقاوم للماء بقصة عصرية مناسبة للخريف والشتاء.",
    price: 89.99,
    images: [img("1591047139829-d91aecb6caea")],
    category: "fashion",
    brand: "UrbanCo",
    model: "MA-1 Bomber",
    stock: 40,
    featured: false,
    rating: 4.4,
  },
  {
    name: "Salvatore Ferragamo Handbag",
    description: "شنطة يد جلد طبيعي بتصميم إيطالي أنيق ولمسة معدنية فاخرة.",
    price: 899.99,
    images: [img("1584917865442-de89df76afd3")],
    category: "fashion",
    brand: "Ferragamo",
    model: "Top-Handle",
    stock: 12,
    featured: true,
    rating: 4.8,
  },
  {
    name: "Fieldline Trek Backpack",
    description: "شنطة ظهر للحمل والرحلات بمساحة 30 لتر وخامة مقاومة للماء.",
    price: 89.99,
    images: [img("1547949003-9792a18a2601")],
    category: "fashion",
    brand: "TrekPack",
    model: "FT-40",
    stock: 70,
    featured: false,
    rating: 4.5,
  },
  // --- Home ---
  {
    name: "Dyson V15 Detect",
    description: "مكنسة كهربائية لاسلكية بليزر يكشف الغبار الخفي وقوة شفط استثنائية.",
    price: 699.99,
    images: [img("1558618666-fcd25c85cd64")],
    category: "home",
    brand: "Dyson",
    model: "V15 Detect",
    stock: 20,
    featured: true,
    rating: 4.8,
  },
  {
    name: "Nespresso Vertuo Next",
    description: "ماكينة قهوة ذكية تتعرف تلقائياً على كل كبسولة وتضبط درجة الحرارة والحجم.",
    price: 179.99,
    images: [img("1495474472287-4d71bcdd2085")],
    category: "home",
    brand: "Nespresso",
    model: "Vertuo Next",
    stock: 40,
    featured: false,
    rating: 4.4,
  },
  {
    name: "IKEA POÄNG Armchair",
    description: "كرسي بذراعين كلاسيكي بإطار بيرش وحشوة مريحة، تصميم اسكندنافي خالد.",
    price: 129.99,
    images: [img("1555041469-a586c61ea9bc")],
    category: "home",
    brand: "IKEA",
    model: "POÄNG",
    stock: 60,
    featured: false,
    rating: 4.3,
  },
  {
    name: "Farah Accent Armchair",
    description: "كرسي مُنحنى بقماش قطني فاخر وأرجل خشبية، قطعة مميزة لأي غرفة معيشة.",
    price: 449.99,
    images: [img("1586023492125-27b2c045efd7")],
    category: "home",
    brand: "Havenly",
    model: "Farah",
    stock: 12,
    featured: true,
    rating: 4.7,
  },
  {
    name: "Nordic Dining Chair",
    description: "كرسي طعام بتصميم إسكندنافي وأرجل خشب طبيعي مع مقطع جلدي مريح.",
    price: 89.99,
    images: [img("1592078615290-033ee584e267")],
    category: "home",
    brand: "Havenly",
    model: "ND-4",
    stock: 80,
    featured: false,
    rating: 4.6,
  },
  {
    name: "Rattan Bedroom Bench",
    description: "مقعد خشبي بتصميم بوهيمي دافئ يضيف لمسة طبيعية لغرفة النوم.",
    price: 219.99,
    images: [img("1583845112203-29329902332e")],
    category: "home",
    brand: "Havenly",
    model: "Rattan Bench",
    stock: 18,
    featured: false,
    rating: 4.5,
  },
  // --- Beauty ---
  {
    name: "Bobbi Brown Makeup Palette",
    description: "مجموعة مكياج كاملة بألوان ترابية دافئة تناسب الإطلالات النهارية والمسائية.",
    price: 74.99,
    images: [img("1522335789203-aabd1fc54bc9")],
    category: "beauty",
    brand: "Bobbi Brown",
    model: "Eye Palette",
    stock: 30,
    featured: false,
    rating: 4.7,
  },
  {
    name: "Organic Skincare Ritual Set",
    description: "مجموعة عناية بالبشرة من زيت بذور القنب والفحم المنشط، بمكونات عضوية معتمدة.",
    price: 89.99,
    images: [img("1631730359585-38a4935cbec4")],
    category: "beauty",
    brand: "Erbology",
    model: "Balance Set",
    stock: 30,
    featured: false,
    rating: 4.6,
  },
  {
    name: "Chanel N°5 Eau de Parfum",
    description: "العطر الأيقوني بتركيبة زهرية دافئة، رمز الأناقة الفرنسية منذ 1921.",
    price: 319.99,
    images: [img("1541643600914-78b084683601")],
    category: "beauty",
    brand: "Chanel",
    model: "N°5",
    stock: 15,
    featured: true,
    rating: 4.9,
  },
  {
    name: "Vitamin C Glow Serum",
    description: "سيروم فيتامين C يوحّد لون البشرة ويمنحها إشراقة طبيعية خلال أسبوعين.",
    price: 29.99,
    images: [img("1615397349754-cfa2066a298e")],
    category: "beauty",
    brand: "GlowLab",
    model: "C-Serum 30ml",
    stock: 90,
    featured: false,
    rating: 4.5,
  },
  {
    name: "Gentle Facial Cleanser",
    description: "غسول لطيف برغوة كريمية ينظف البشرة بعمق دون أن يجففها.",
    price: 24.99,
    images: [img("1556228720-195a672e8a03")],
    category: "beauty",
    brand: "Curology",
    model: "The Cleanser",
    stock: 120,
    featured: false,
    rating: 4.4,
  },
  // --- Books ---
  {
    name: "milk and honey — Rupi Kaur",
    description: "مجموعة شعر عن الحب والشفاء والوجود، من أكثر الكتب مبيعاً في العالم.",
    price: 14.99,
    images: [img("1544947950-fa07a98d237f")],
    category: "books",
    brand: "Andrews McMeel",
    model: "Paperback",
    stock: 150,
    featured: false,
    rating: 4.8,
  },
  {
    name: "Deep Work — Cal Newport",
    description: "دليل عملي للتركيز العميق في عالم مشتت، من أكثر كتب الإنتاجية تأثيراً.",
    price: 19.99,
    images: [img("1544716278-ca5e3f4abd8c")],
    category: "books",
    brand: "Grand Central",
    model: "Hardcover",
    stock: 55,
    featured: false,
    rating: 4.7,
  },
  {
    name: "Startup Classics Bundle",
    description: "حزمة من أهم كتب ريادة الأعمال: Zero to One وThe Lean Startup وأكثر.",
    price: 45.99,
    images: [img("1512820790803-83ca734da794")],
    category: "books",
    brand: "Penguin",
    model: "Bundle of 5",
    stock: 25,
    featured: false,
    rating: 4.6,
  },
  // --- Toys ---
  {
    name: "LEGO Classic Creative Bricks",
    description: "علبة مكعبات ملونة بألوان متنوعة تفتح الباب للخيال والبناء بلا حدود.",
    price: 29.99,
    images: [img("1587654780291-39c9404d746b")],
    category: "toys",
    brand: "LEGO",
    model: "Classic 10704",
    stock: 150,
    featured: true,
    rating: 4.8,
  },
  {
    name: "Kids Camera Toy",
    description: "كاميرا أطفال سهلة الاستخدام بغطاء واقٍ وتصميم مريح لأيادي صغيرة.",
    price: 34.99,
    images: [img("1516627145497-ae6968895b74")],
    category: "toys",
    brand: "SnapKid",
    model: "KC-100",
    stock: 55,
    featured: false,
    rating: 4.5,
  },
]


async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  for (const demo of DEMO_USERS) {
    // Upsert so a second run does not fail on the unique email.
    await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: { ...demo, password: passwordHash },
    })
  }

  console.log("Demo accounts (local development only):")
  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.role.padEnd(5)} ${demo.email}  ${DEMO_PASSWORD}`)
  }
}

async function main() {
  await seedUsers()

  // Products are replaced wholesale, so editing the list above and re-running
  // gives a clean catalogue. Orders are cleared too, because their line items
  // point at the products being replaced.
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.product.deleteMany()

  const products = new Map<string, { id: string; price: number }>()
  for (const product of PRODUCTS) {
    const created = await prisma.product.create({ data: product })
    products.set(created.name, { id: created.id, price: created.price })
  }

  await seedReviews(products)
  await seedOrders(products)
  await seedWishlist(products)

  const [productCount, reviewCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.review.count(),
    prisma.order.count(),
  ])
  console.log(
    `Seed complete: ${productCount} products, ${reviewCount} reviews, ${orderCount} orders.`,
  )
}

type SeededProduct = { id: string; price: number }

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

/**
 * Reviews from the demo customers. The app renders the product's rating column
 * as-is, so the seeded ratings sit near the stars of the review comments below.
 */
async function seedReviews(products: Map<string, SeededProduct>) {
  const usersByEmail = new Map(
    (await prisma.user.findMany()).map((u) => [u.email, u.id]),
  )

  const REVIEWS: { product: string; email: string; rating: number; comment: string; daysAgo: number }[] = [
    { product: "Apple MacBook Pro 14-inch M3", email: "customer@nexmart.local", rating: 5, comment: "أفضل لابتوب اشتريته، البطارية فعلاً بتقعد يوم شغل كامل.", daysAgo: 9 },
    { product: "Apple MacBook Pro 14-inch M3", email: "ahmed@nexmart.local", rating: 5, comment: "التغليف كان ممتاز والأداء أسرع من المتوقع.", daysAgo: 12 },
    { product: "Sony WH-1000XM5", email: "ahmed@nexmart.local", rating: 5, comment: "إلغاء الضوضاء رهيب في المترو.", daysAgo: 12 },
    { product: "Sony WH-1000XM5", email: "sara@nexmart.local", rating: 4, comment: "الصوت نقي جداً بس الحالة مش كبيرة.", daysAgo: 14 },
    { product: "Nike Air Max 270", email: "omar@nexmart.local", rating: 4, comment: "مقاسه مضبوط ومريح جداً للمشي الطويل.", daysAgo: 15 },
    { product: "Sony PlayStation 5 Console", email: "omar@nexmart.local", rating: 5, comment: "تجربة ألعاب مجنونة، ووصل أسرع من المتوقع.", daysAgo: 18 },
    { product: "Dyson V15 Detect", email: "laila@nexmart.local", rating: 5, comment: "تستاهل كل جنيه، الليزر بيفرق فعلاً في التنظيف.", daysAgo: 20 },
    { product: "Farah Accent Armchair", email: "sara@nexmart.local", rating: 5, comment: "جودة القماش ممتازة واللون أجمل من الصورة.", daysAgo: 8 },
    { product: "Chanel N°5 Eau de Parfum", email: "laila@nexmart.local", rating: 5, comment: "ثبات العطر ممتاز وعبوة فخمة جداً.", daysAgo: 4 },
    { product: "LEGO Classic Creative Bricks", email: "sara@nexmart.local", rating: 5, comment: "ابني بيقضي ساعات بيلعب بيها، جودة LEGO المعروفة.", daysAgo: 7 },
    { product: "milk and honey — Rupi Kaur", email: "customer@nexmart.local", rating: 5, comment: "كتاب جميل وقصير، خلصته في يوم.", daysAgo: 5 },
    { product: "Nespresso Vertuo Next", email: "ahmed@nexmart.local", rating: 4, comment: "القهوة طعمها زي المحلات، بس الكبسولات بتخلص بسرعة.", daysAgo: 11 },
  ]

  for (const review of REVIEWS) {
    const product = products.get(review.product)
    const userId = usersByEmail.get(review.email)
    if (!product || !userId) continue
    await prisma.review.create({
      data: {
        rating: review.rating,
        comment: review.comment,
        userId,
        productId: product.id,
        createdAt: daysAgo(review.daysAgo),
      },
    })
  }
}

/**
 * A handful of orders for the demo customer, in every status the orders page
 * and admin dashboard know about, with shipping details shaped exactly like
 * the checkout form sends them.
 */
async function seedOrders(products: Map<string, SeededProduct>) {
  const usersByEmail = new Map(
    (await prisma.user.findMany()).map((u) => [u.email, u.id]),
  )

  const SHIPPING = {
    fullName: "Nour Hassan",
    email: "customer@nexmart.local",
    phone: "+20 103 079 6415",
    address: "12 El-Nasr St, Nasr City",
    city: "Cairo",
    state: "Cairo",
    zipCode: "11511",
    country: "Egypt",
    notes: "",
  }

  const ORDER_PLANS: {
    email: string
    status: string
    paymentMethod: string
    daysAgo: number
    items: { product: string; quantity: number }[]
  }[] = [
    {
      email: "customer@nexmart.local",
      items: [
        { product: "Apple MacBook Pro 14-inch M3", quantity: 1 },
        { product: "Sony WH-CH520 Headphones", quantity: 1 },
      ],
      status: "delivered",
      paymentMethod: "card",
      daysAgo: 12,
    },
    {
      email: "customer@nexmart.local",
      items: [{ product: "Nike Air Max 270", quantity: 1 }],
      status: "delivered",
      paymentMethod: "cash_on_delivery",
      daysAgo: 6,
    },
    {
      email: "customer@nexmart.local",
      items: [{ product: "Gentle Facial Cleanser", quantity: 2 }],
      status: "shipped",
      paymentMethod: "card",
      daysAgo: 3,
    },
    {
      email: "customer@nexmart.local",
      items: [{ product: "Chanel N°5 Eau de Parfum", quantity: 1 }],
      status: "pending",
      paymentMethod: "card",
      daysAgo: 1,
    },
  ]

  for (const plan of ORDER_PLANS) {
    const userId = usersByEmail.get(plan.email)
    if (!userId) continue

    const items = plan.items
      .map((item) => {
        const product = products.get(item.product)
        return product
          ? { productId: product.id, quantity: item.quantity, price: product.price }
          : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    if (items.length === 0) continue

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    await prisma.order.create({
      data: {
        userId,
        total,
        status: plan.status,
        paymentMethod: plan.paymentMethod,
        shippingDetails: SHIPPING,
        createdAt: daysAgo(plan.daysAgo),
        items: {
          create: items,
        },
      },
    })
  }
}

async function seedWishlist(products: Map<string, SeededProduct>) {
  const customer = await prisma.user.findUnique({
    where: { email: "customer@nexmart.local" },
  })
  if (!customer) return

  const wishlistNames = [
    "Apple iPad Pro 12.9-inch M2",
    "Sony PlayStation 5 Console",
    "LEGO Classic Creative Bricks",
  ]
  for (const name of wishlistNames) {
    const product = products.get(name)
    if (!product) continue
    await prisma.wishlist.create({
      data: { userId: customer.id, productId: product.id },
    })
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
