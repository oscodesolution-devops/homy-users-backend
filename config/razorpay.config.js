import Razorpay from 'razorpay';
import { configDotenv } from 'dotenv';

configDotenv();
// Create a Razorpay instance with your credentials
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST,
    key_secret: process.env.RAZORPAY_SECRET,
  });