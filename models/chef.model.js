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
  },
  businessName: {
    type: String,
    // required: true,
    trim: true
  },
  address: {
    address1: {
        type: String,
        // required: true
    },
    address2: {
        type: String
    },
    city: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    },
    pincode: {
        type: String,
        // required: true
    }
  },
  PhoneNo: {
    type: String,
    // required: true,
    unique: true,
    minLength: 10,
    maxLength: 13,
    trim:true
  },
  document: {
    type: {
        type: String,
        // required: true
    },
    documentNo: {
        type: String,
        // required: true
    },
    docsPhoto: {
        front: {
            type: String,
            // required: true
        },
        back: {
            type: String,
            // required: true
        }
    }
  },
  verificationStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Verified', 'Rejected']
  }
}, { timestamps: true });


const Chef = mongoose.model("Chef", chefSchema);
export default Chef;
