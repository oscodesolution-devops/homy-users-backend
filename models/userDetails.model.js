import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  mealFrequency: {
    type: Number,
    required: true,
  },
  activityLevel: {
    type: String,
    enum: ["Sedentary", "Lightly Active", "Active", "Very Active"],
    required: true,
  },
  dietaryPreferences: {
    type: [String],
    enum: ['Vegetarian',
    'Vegan',
    'Keto',
    'Low fat',
    'Low carb',
    'Sugar free',
    'Non-vegetarian',
    'Gluten-free']
  },
  dietaryNote: {
    type: String,
  },
  fitnessGoals: {
    type: [String],
    enum:['Weight loss',
    'Muscle gain',
    'Low fat',
    'Control diabetes',
    'Manage blood sugar',
    'Postpartum Recovery',
    'Gluten-free',
    'Lean-muscle',
    'Boost immunity']
  },
  fitnessNote: {
    type: String,
  },
  healthCondition: {
    type: [String],
    enum:["Diabetes", "High Blood Pressure", "Thyroid Issues", "Lactose Intolerance", "Celiac Disease"]
  },
  healthNote: {
    type: String,
  },
  score:{
    type:Number
  },
}, {
  timestamps: true,
});


const UserDetails = mongoose.model("userDetails", userDetailsSchema);

 export default UserDetails;