import mongoose from "mongoose";

const plansSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Please provide a Type"],
  },
  description:{
    type: String,
    required: [true,"Please provide a description"],
  },
  features:[{
    type:String
  }],
  morningPrice: {
    type: Number,
    required: [true, "Please provide a Morning Price"],
  },
  eveningPrice: {
    type: Number,
    required: [true, "Please provide an Evening Price"],
  },
  servesUpto: {
    type: Number,
    required: [true, "Please provide the number of people the plan serves up to"],
  },
  extraPersonCharge: {
    type: Number,
    required: [true, "Please provide the extra person charge"],
  },
}, {
  timestamps: true,
});

const Plan = mongoose.model("Plan", plansSchema);

export default Plan;