import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.config.js';

// Function to generate Razorpay order
export const generateRazorpayOrder = async (totalAmount) => {
  try {
    const options = {
      amount: totalAmount*100, // Amount in smallest currency unit (paisa if INR)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error generating Razorpay order:', error);
    throw new Error('Unable to generate Razorpay order');
  }
};

// Function to verify Razorpay signature
export const verifyRazorpaySignature = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    // Get payment details from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);
    console.log(payment)
    
    // Verify that the order ID matches
    if (payment.order_id !== razorpayOrderId) {
      console.error('Order ID mismatch');
      return false;
    }

    // Generate the signature verification string
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    // Generate the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Compare the signatures
    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      console.error('Signature verification failed');
      return false;
    }

    // Additional verification: Check if payment is captured
    return payment.status === 'captured';
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

// Optional: Helper function to validate payment status
export const validatePaymentStatus = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return {
      isValid: payment.status === 'captured',
      status: payment.status,
      orderId: payment.order_id,
      amount: payment.amount
    };
  } catch (error) {
    console.error('Error validating payment status:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};