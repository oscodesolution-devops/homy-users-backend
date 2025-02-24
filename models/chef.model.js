import mongoose from "mongoose";

const chefSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  profilePicture: {
    type: String, // Store file path or URL
    required: true
  },
  resume: {
    type: String, // Store file path or URL
    // required: true
  },
  characterCertificate: {
    type: String, // Store file path or URL
    // required: true
  },
  canCook: {
    type: Boolean,
  },
  previousWorkplace: {
    type: [String],
    default: []
  },
  readyForHomeKitchen: {
    type: Boolean,
    
  },
  preferredCities: {
    type: [String],
    
  },
  currentCity: {
    type: String,
  },
  currentArea: {
    type: String,
  },
  cuisines: {
    type: [String],
  },
  travelMode: {
    type: String,
    enum: ['metro', 'bike'],
  },
  cooksNonVeg: {
    type: Boolean,
  },
  readingLanguage: {
    type: String,
  },
  experienceYears: {
    type: String,
  },
  currentSalary: {
    type: Number,
    min: 0
  }
}, { timestamps: true });


const Chef = mongoose.model("Chef", chefSchema);
export default Chef;
