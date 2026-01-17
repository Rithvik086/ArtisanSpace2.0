import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  PORT: number;
  NODE_ENV: "development" | "production";
  MONGO_URI: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  FRONTEND_URL: string;
  SKIP_DB?: string | undefined;
  RAZORPAY_API_KEY: string;
  RAZORPAY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string
}

// Validate and parse environment variables
function validateConfig(): Config {
  const requiredEnvVars = [
    "PORT",
    "NODE_ENV",
    "MONGO_URI",
    "JWT_SECRET",
    "CORS_ORIGIN",
    "MAIL_USER",
    "MAIL_PASS",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "FRONTEND_URL",
    "RAZORPAY_API_KEY",
    "RAZORPAY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ];

  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== "development" && nodeEnv !== "production") {
    throw new Error('NODE_ENV must be either "development" or "production"');
  }

  return {
    PORT: parseInt(process.env.PORT!, 10),
    NODE_ENV: nodeEnv as "development" | "production",
    MONGO_URI: process.env.MONGO_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    MAIL_USER: process.env.MAIL_USER!,
    MAIL_PASS: process.env.MAIL_PASS!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    SKIP_DB: process.env.SKIP_DB,
    RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY!,
    RAZORPAY_SECRET: process.env.RAZORPAY_SECRET!,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!
  };
}

// Validate config on module load
const config = validateConfig();

export default config;
