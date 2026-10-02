import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .trim()
    .default("mongodb://localhost:27017/pi_db"),
  JWT_SECRET: z
    .string()
    .trim()
    .default("tEH4y60N9DoFmafil/t3nbhrYbg4pSyvCogYJiiK+rY="),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .trim()
    .default("http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: z.string().trim().default("your_cloudinary_cloud_name"),
  CLOUDINARY_API_KEY: z.string().trim().default("your_cloudinary_api_key"),
  CLOUDINARY_API_SECRET: z.string().trim().default("your_cloudinary_api_secret"),
  MISTRAL_API_KEY: z.string().trim().default("dummy_mistral_key"),
});

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/pi_db",
  JWT_SECRET: process.env.JWT_SECRET || "tEH4y60N9DoFmafil/t3nbhrYbg4pSyvCogYJiiK+rY=",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "your_cloudinary_cloud_name",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "your_cloudinary_api_key",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "your_cloudinary_api_secret",
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "dummy_mistral_key",
});

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/pi_db",
  JWT_SECRET: process.env.JWT_SECRET || "tEH4y60N9DoFmafil/t3nbhrYbg4pSyvCogYJiiK+rY=",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
};
export type Env = z.infer<typeof envSchema>;
