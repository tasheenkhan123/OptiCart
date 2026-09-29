import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env then cwd .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();


export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Gemini AI & Search Grounding
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  hasGeminiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
  
  // Optional Live Web Search APIs
  SERPAPI_API_KEY: process.env.SERPAPI_API_KEY || '',
  hasSerpApiKey: !!(process.env.SERPAPI_API_KEY && process.env.SERPAPI_API_KEY.trim() !== ''),
  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY || '',
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
  hasGoogleSearchApi: !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),

  // Optional Merchant Direct APIs
  AMAZON_PAAPI_KEY: process.env.AMAZON_PAAPI_KEY || '',
  AMAZON_PAAPI_SECRET: process.env.AMAZON_PAAPI_SECRET || '',
  AMAZON_ASSOCIATE_TAG: process.env.AMAZON_ASSOCIATE_TAG || '',
  hasAmazonPaapi: !!(process.env.AMAZON_PAAPI_KEY && process.env.AMAZON_PAAPI_SECRET && process.env.AMAZON_ASSOCIATE_TAG),

  CROMA_PARTNER_API_KEY: process.env.CROMA_PARTNER_API_KEY || '',
  hasCromaApi: !!(process.env.CROMA_PARTNER_API_KEY && process.env.CROMA_PARTNER_API_KEY.trim() !== ''),

  NYKAA_PARTNER_API_KEY: process.env.NYKAA_PARTNER_API_KEY || '',
  hasNykaaApi: !!(process.env.NYKAA_PARTNER_API_KEY && process.env.NYKAA_PARTNER_API_KEY.trim() !== ''),

  // Razorpay Payment Benefits & Offers API
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  hasRazorpayApi: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),

  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
