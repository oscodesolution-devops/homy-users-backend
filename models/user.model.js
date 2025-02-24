import mongoose from "mongoose";

// Define an Address Schema separately for better structure and validation
const addressSchema = new mongoose.Schema(
  {
    pincode: {
      type: Number,
      minlength: [6, "Pincode should be at least 6 digits."], // Assuming 6-digit pincode for example
      maxlength: [6, "Pincode should be at most 6 digits."],
    },
    city: {
      type: String,
      maxlength: [50, "City name should be under 50 characters."],
    },
    area: {
      type: String,
      maxlength: [100, "Area name should be under 100 characters."],
    },
    locality: {
      type: String,
      maxlength: [100, "Locality should be under 100 characters."],
    },
    houseNo: {
      type: String,
      maxlength: [20, "House number should be under 20 characters."],
    },
  },
  { _id: false }
); // Disable _id for nested schemas to avoid redundant IDs

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: Number,
      required: [true, "Please provide a phone number"],
      minlength: [10, "Phone number should be of 10 characters."],
      maxlength: [10, "Phone number should be of 10 characters."],
      trim: true,
    },
    firstName: {
      type: String,
      maxlength: [40, "First Name should be under 40 characters."],
    },
    lastName: {
      type: String,
      maxlength: [40, "Last Name should be under 40 characters."],
    },
    email: {
      type: String,
    },
    uid:{
      type: String,
    },
    address: {
      type: mongoose.Schema.Types.Mixed, // Accept mixed types (object or string)
      validate: {
        validator: function (value) {
          // Allow address to be either a string or a valid object based on the addressSchema
          return (
            typeof value === "string" ||
            (typeof value === "object" &&
              value !== null &&
              Object.keys(addressSchema.paths).every((key) => key in value))
          );
        },
        message: "Address must be either a string or a valid address object",
      },
    },
    isNewUser: {
      type: Boolean,
      default: true,
    },
    activePlan:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      // required: true,
    }
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    return next(); // Skip if this is a new user being created
  }

  try {
    if (this.firstName && this.lastName && this.email && this.isNewUser) {
      this.isNewUser = false; // Update flag if UserDetails exists
    }
    next();
  } catch (error) {
    next(error);
  }
});
const User = mongoose.model("User", userSchema, "user");

export default User;
