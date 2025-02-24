import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: "Please enter a valid email address"
      }
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Adjust the regex for international formats if needed
        },
        message: "Phone number must be 10 digits"
      }
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [10, "Message must be at least 10 characters long"],
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    comment:{
      type:String,
    },
    status:{
        type: String,
        default: "Pending"
    }
  },{
    timestamps:true
  });
  
  const Query = mongoose.model("Query", querySchema);

export default Query;