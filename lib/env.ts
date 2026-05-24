export const env = {
  mongodbUri: process.env.MONGODB_URI,
  nextAuthSecret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redisUrl: process.env.REDIS_URL,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  cashfreeAppId: process.env.CASHFREE_APP_ID,
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  openAiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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
