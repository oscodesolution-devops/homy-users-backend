import mongoose from "mongoose";

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Discount code is required"],
    unique: true,
  },
  discountAmount: {
    type: Number,
    required: [true, "Discount amount is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const DiscountCode = mongoose.model("DiscountCode", discountCodeSchema);

export default DiscountCode;
