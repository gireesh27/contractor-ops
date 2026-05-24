export const env = {
  mongodbUri: process.env.MONGODB_URI || process.env.DATABASE_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redisUrl: process.env.REDIS_URL,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  cashfreeAppId: process.env.CASHFREE_APP_ID,
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY,
  cashfreeEnv: process.env.CASHFREE_ENV || "sandbox",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  openAiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  superAdminEmails: (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
};

export function hasMongo() {
  return Boolean(env.mongodbUri);
}

export function hasAiProvider() {
  return Boolean(env.openAiApiKey || env.geminiApiKey);
}

export function configuredPaymentGateway() {
  if (env.razorpayKeyId && env.razorpayKeySecret) return "razorpay";
  if (env.cashfreeAppId && env.cashfreeSecretKey) return "cashfree";
  return "manual";
}

export function isSuperAdminEmail(email?: string | null) {
  return Boolean(email && env.superAdminEmails.includes(email.toLowerCase()));
}

export function cashfreeBaseUrl() {
  return env.cashfreeEnv === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}
