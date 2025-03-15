import mongoose from 'mongoose';

const checkInOutSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealTime: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedOut: {
    type: Boolean,
    default: false
  },
  checkinTime: Date,
  checkoutTime: Date,
  checkoutImage: {
    type: String,
    default: null
  }
});

// Compound index to ensure one record per order per date per meal time
checkInOutSchema.index({ orderId: 1, date: 1, mealTime: 1 }, { unique: true });

export default mongoose.model('CheckInOut', checkInOutSchema);