import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your name").max(80),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(11, "Enter a valid BD phone number")
      .max(20)
      .regex(/^[0-9+\-\s]+$/, "Digits only"),
    password: z.string().min(8, "At least 8 characters").max(100),
  })
  .strict();

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

/** Admin creating a user account from the panel. Phone is optional here. */
export const adminUserSchema = z.object({
  name: z.string().min(2, "Enter a name").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s]*$/, "Digits only")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(100),
  role: z.enum(["CUSTOMER", "ADMIN"]).default("CUSTOMER"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .min(11, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Digits only"),
  email: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().min(6, "Enter your full address").max(240),
  area: z.string().min(2, "Enter your area / thana").max(80),
  city: z.string().min(2).max(60).default("Dhaka"),
  note: z.string().max(400).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD"]),
  transactionId: z.string().max(40).optional().or(z.literal("")),
  senderNumber: z.string().max(20).optional().or(z.literal("")),
  discountCode: z.string().max(24).optional().or(z.literal("")),
  /** What the checkout UI showed the customer — the server rejects the order if
   *  its own computed total differs (price changed since add-to-cart). */
  expectedTotal: z.coerce.number().int().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        quantity: z.coerce.number().int().min(1).max(20),
        purchaseOption: z.enum(["one-time", "subscribe"]).default("one-time"),
        frequencyWeeks: z.coerce.number().int().min(1).max(52).optional(),
      }),
    )
    .min(1, "Your cart is empty"),
});

export const productSchema = z.object({
  name: z.string().min(2).max(140),
  slug: z.string().min(2).max(160).optional().or(z.literal("")),
  description: z.string().min(10).max(4000),
  price: z.coerce.number().int().min(1).max(1_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  costPrice: z.coerce.number().int().min(0).max(1_000_000).default(0),
  subscribePrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  categoryId: z.string().min(1, "Pick a category"),
  images: z.array(z.string()).default([]),
  tags: z.string().max(300).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  // tea detail
  tastingNotes: z.array(z.string().max(40)).max(8).default([]),
  origin: z.string().max(120).optional().or(z.literal("")),
  altitude: z.string().max(60).optional().or(z.literal("")),
  process: z.string().max(120).optional().or(z.literal("")),
  harvest: z.string().max(80).optional().or(z.literal("")),
  brewTemp: z.string().max(40).optional().or(z.literal("")),
  brewDose: z.string().max(40).optional().or(z.literal("")),
  brewSteep: z.string().max(40).optional().or(z.literal("")),
  brewBestWith: z.string().max(120).optional().or(z.literal("")),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #C89A3E")
    .default("#C89A3E"),
  accentDark: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #A97F2E")
    .default("#A97F2E"),
  variants: z
    .array(
      z.object({
        size: z.string().min(1).max(12),
        stock: z.coerce.number().int().min(0).max(100000),
      }),
    )
    .min(1, "Add at least one weight"),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80).optional().or(z.literal("")),
  description: z.string().max(400).optional().or(z.literal("")),
  image: z.string().max(500).optional().or(z.literal("")),
});

export const collectionSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
  image: z.string().max(500).optional().or(z.literal("")),
  active: z.boolean().default(true),
  productIds: z.array(z.string()).default([]),
});

export const discountSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().int().min(1).max(1_000_000),
  minSubtotal: z.coerce.number().int().min(0).max(1_000_000).default(0),
  maxUses: z.coerce.number().int().min(1).max(1_000_000).optional(),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export const postSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(180).optional().or(z.literal("")),
  excerpt: z.string().min(10).max(400),
  category: z.string().min(2).max(60),
  body: z.array(z.string().max(4000)).min(1, "Add at least one paragraph"),
  coverImage: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const subscriptionSchema = z.object({
  frequencyWeeks: z.coerce.number().int().min(1).max(52),
  nextShipAt: z.string().min(1, "Pick a date"),
  variantId: z.string().optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  source: z.string().max(24).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  topic: z.string().max(40).optional(),
  message: z.string().trim().min(5, "Write a message").max(4000),
});

/** Admin creating an order by hand. */
export const manualOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20).regex(/^[0-9+\-\s]+$/, "Digits only"),
  email: z.string().trim().email().optional().or(z.literal("")),
  addressLine: z.string().trim().min(4).max(240),
  area: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60).default("Dhaka"),
  note: z.string().max(400).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD"]).default("COD"),
  paymentStatus: z
    .enum(["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"])
    .default("UNPAID"),
  status: z
    .enum(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"])
    .default("PENDING"),
  shippingOverride: z.coerce.number().int().min(0).max(100000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1, "Add at least one line"),
});

/** Admin POS counter sale. */
export const storeSaleSchema = z.object({
  locationId: z.string().min(1),
  paymentMethod: z.enum(["CASH", "BKASH", "NAGAD", "CARD"]).default("CASH"),
  discount: z.coerce.number().int().min(0).max(1_000_000).default(0),
  customerName: z.string().max(80).optional().or(z.literal("")),
  customerPhone: z.string().max(20).optional().or(z.literal("")),
  note: z.string().max(400).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(1000),
      }),
    )
    .min(1, "Add at least one line"),
});
