import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  totalPeople: {
    type: Number,
    required: true,
    min: 1
  },
  morningMealTime: {
    type: String, // Unix timestamp
    required: true
  },
  eveningMealTime: {
    type: String, // Unix timestamp
    required: true
  },
  chefDayOff: {
    type: String, // Array of strings for days of the week
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] // Restrict to valid days
  },
  planStartDate: {
    type: Date,
    required: true
  },
  specialInstruction: {
    type: String
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  extraPersonAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'failed'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    index: true // Add index for efficient query
  },
  chef: { // New field to store the assigned chef
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: false
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  checkedOutAt: {
    type: Date,
    default:null
  },
  checkoutImage: {
    type: [String], // Ensure it's an array of strings (file paths)
    default: [],
  },

  checkinStatus: { //i added it
    type: String,
    enum: ['not checked in', 'checked in', 'checked out'],
    default: 'not checked in'
  }
}, {
  timestamps: true // Enable built-in createdAt and updatedAt fields
});

// Mongoose middleware to set the expiresAt field
orderSchema.pre('save', function (next) {
  const expirationDays = 7; // Set the expiration period (e.g., 7 days)
  this.expiresAt = new Date(this.createdAt.getTime() + expirationDays * 24 * 60 * 60 * 1000);
  next();
});

// Mongoose middleware to automatically cancel expired orders
orderSchema.pre('save', async function (next) {
  const now = new Date();
  if (this.status === 'pending' && this.expiresAt < now) {
    this.status = 'cancelled';
    await this.save();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;