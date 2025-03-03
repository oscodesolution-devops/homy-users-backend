import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import { uploadToCloudinary } from "../middlewares/upload.js";
import db from "../models/index.js";
import calculateHealthScore from "../utils/calculateHealthScore.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
const client = twilio(accountSid, authToken);

const updateUser = async (req, res, next) => {
  const { firstName, lastName, email, address } = req.body;
  const user = req.user;
  try {
    // Find the user and update with new values
    const updatedUser = await db.User.findByIdAndUpdate(
      user._id,
      {
        firstName,
        lastName,
        email,
        address,
      },
      { new: true } // Return the updated document
    );
    await updatedUser.save();
    if (!updatedUser) {
      return next(createCustomError("User Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "User updated successfully",
      updatedUser
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const createOrUpdateUserDetails = async (req, res, next) => {
  const {
    age,
    gender,
    weight,
    height,
    mealFrequency,
    activityLevel,
    dietaryPreferences,
    dietaryNote,
    fitnessGoals,
    fitnessNote,
    healthCondition,
    healthNote,
  } = req.body;
  const user = req.user;
  if (
    !age ||
    !gender ||
    !weight ||
    !height ||
    !mealFrequency ||
    !activityLevel
  ) {
    return next(createCustomError("Please provide missing details", 404));
  }
  const score = calculateHealthScore({
    age,
    gender,
    weight,
    height,
    mealFrequency,
    activityLevel,
    dietaryPreferences,
    dietaryNote,
    fitnessGoals,
    fitnessNote,
    healthCondition,
    healthNote,
  });
  try {
    // Check if UserDetails already exists for the given userId
    let userDetails = await db.UserDetails.findOne({ userID: user._id });

    if (userDetails) {
      // Update existing UserDetails
      userDetails = await db.UserDetails.findOneAndUpdate(
        { userID: user._id },
        {
          age,
          gender,
          weight,
          height,
          mealFrequency,
          activityLevel,
          dietaryPreferences,
          dietaryNote,
          fitnessGoals,
          fitnessNote,
          healthCondition,
          healthNote,
          score,
        },
        { new: true } // Return the updated document
      );

      const response = sendSuccessApiResponse(
        "User details updated successfully",
        userDetails
      );
      return res.status(200).send(response);
    } else {
      // Create new UserDetails
      const newUserDetails = new db.UserDetails({
        userID: user._id,
        age,
        gender,
        weight,
        height,
        mealFrequency,
        activityLevel,
        dietaryPreferences,
        dietaryNote,
        fitnessGoals,
        fitnessNote,
        healthCondition,
        healthNote,
      });

      await newUserDetails.save();
      const response = sendSuccessApiResponse(
        "User details created successfully",
        newUserDetails
      );
      return res.status(201).send(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await db.User.countDocuments();
    const users = await db.User.find()
      .skip(startIndex)
      .limit(limit)
      .select("-password"); // Exclude the password field

    const response = sendSuccessApiResponse("Users retrieved successfully", {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    let { userId } = req.params;
    if (!userId) {
      userId = req.user._id
    }
    const user = await db.User.findOne({ _id: userId }).populate("activePlan");
    let userDetails = await db.UserDetails.findOne({
      userID: userId,
    });

    let order;
    if (user?.activePlan) {
      order = await db.Order.findOne({ user: userId, planID: user.activePlan._id })
    }
    if (!userDetails && !user) {
      return next(createCustomError("User details not found", 404));
    }

    const response = sendSuccessApiResponse(
      "User details retrieved successfully",
      { userDetails, user, order }
    );
    console.log(response)
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;

    const regex = new RegExp(query, "i"); // 'i' for case-insensitive search

    const total = await db.User.countDocuments({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    });

    const users = await db.User.find({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    })
      .skip(startIndex)
      .limit(limit)
      .select("-password");

    const response = sendSuccessApiResponse("Users retrieved successfully", {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
const searchChefs = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;

    const regex = new RegExp(query, "i"); // 'i' for case-insensitive search

    const total = await db.Chef.countDocuments({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    });

    const chefs = await db.Chef.find({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    })
      .skip(startIndex)
      .limit(limit)
      .select("-password");

    const response = sendSuccessApiResponse("Users retrieved successfully", {
      chefs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
export const getAllChefs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const total = await db.Chef.countDocuments();
    const limit = req.query.limit ? parseInt(req.query.limit) : total; // Agar limit na ho to sab chefs le ao

    const startIndex = (page - 1) * limit;

    const chefs = await db.Chef.find()
      .skip(startIndex)
      .limit(limit); // Exclude the password field

    console.log(chefs);

    const response = sendSuccessApiResponse("Chefs retrieved successfully", {
      chefs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};


const createAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.Admin.findOne({ email });
    if (existingAdmin) {
      return next(createCustomError("Admin already exists", 501));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new db.Admin({
      email,
      password: hashedPassword,
    });

    // Save admin to database
    const savedAdmin = await newAdmin.save();

    // Create JWT token
    const token = jwt.sign({ id: savedAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    const response = sendSuccessApiResponse("Admin created successfully", {
      admin: {
        id: savedAdmin._id,
        email: savedAdmin.email,
      },
      token,
    });

    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
};

export const LoginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await db.Admin.findOne({ email });
    if (!admin) {
      return next(createCustomError("Invalid credentials", 404));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return next(createCustomError("Invalid credentials", 404));
    }

    // Create JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const response = sendSuccessApiResponse("Admin created successfully", {
      admin: {
        id: admin._id,
        email: admin.email,
      },
      token,
    });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
const createChef = async (req, res, next) => {
  console.log("Request is entering this route", req.body);

  try {
    console.log("Uploaded files:", req.files);

    // Validate required file uploads
    if (!req.files || !req.files.profilePicture) {
      return next(createCustomError('Profile picture is required', 400));
    }
    // Upload files to Cloudinary
    const [profilePictureUrl, resumeUrl, characterCertificateUrl, documentFrontUrl, documentBackUrl] = await Promise.all([
      uploadToCloudinary(req.files?.profilePicture[0], 'profile-pictures'),
      req.files?.resume ? uploadToCloudinary(req.files?.resume[0], 'resumes') : Promise.resolve(null),
      req.files?.characterCertificate ? uploadToCloudinary(req.files?.characterCertificate[0], 'character-certificates') : Promise.resolve(null),
      req.files['document.front'] ? uploadToCloudinary(req.files['document.front'][0], 'document-front') : Promise.resolve(null), // <-- Fix
      req.files['document.back'] ? uploadToCloudinary(req.files['document.back'][0], 'document-back') : Promise.resolve(null)  // <-- Fix
    ]);
    // Function to parse JSON arrays safely
    const parseJsonArray = (field) => {
      try {
        return JSON.parse(req.body[field] || '[]');
      } catch {
        return [];
      }
    };

    // Create chef document
    const newChef = new db.Chef({
      name: req.body?.name,
      gender: req.body?.gender || null,
      profilePicture: profilePictureUrl || null,
      resume: resumeUrl || null,
      characterCertificate: characterCertificateUrl,
      canCook: JSON.parse(req.body?.canCook || 'false'),
      previousWorkplace: parseJsonArray('previousWorkplace'),
      readyForHomeKitchen: JSON.parse(req.body?.readyForHomeKitchen || 'false'),
      preferredCities: parseJsonArray('preferredCities'),
      currentCity: req.body?.currentCity,
      currentArea: req.body?.currentArea,
      cuisines: parseJsonArray('cuisines'),
      travelMode: req.body?.travelMode,
      cooksNonVeg: JSON.parse(req.body.cooksNonVeg || 'false'),
      readingLanguage: req.body?.readingLanguage,
      experienceYears: req.body?.experienceYears,
      currentSalary: parseFloat(req.body?.currentSalary) || 0,
      businessName: req.body?.businessName,
      address: req.body?.address ? JSON.parse(req.body?.address) : null,
      PhoneNo: "+91" + req.body?.PhoneNo || null,
      document: {
        type: req.body?.documentType || null,
        documentNo: req.body?.documentNo || null,
        docsPhoto: {
          front: documentFrontUrl,
          back: documentBackUrl
        }
      },
      verificationStatus: req.body?.verificationStatus || 'Pending',
    });

    // Save chef
    const savedChef = await newChef.save();

    // Prepare response
    const response = sendSuccessApiResponse("Chef created successfully", {
      chef: {
        id: savedChef._id,
        ...savedChef.toObject(),
      },
    });
    if(response.success = true){
      res.status(201).send({statuscode:response.status.code,message:"Your Details Are Sent For Verification"});
    }
    else{
      res.status(201).send({message: response.message});
    }
    
  } catch (error) {
    console.error("Error in createChef:", error);
    next(error);
  }
};

// const createChefForPartnerApp = async (req, res, next) => {
//   console.log("Request is entering this route", req.body);

//   try {
//     console.log("Uploaded files:", req.files);

//     // Validate required file uploads
//     if (!req.files || !req.files.profilePicture) {
//       return next(createCustomError('Profile picture is required', 400));
//     }

//     // Upload files to Cloudinary
//     const [profilePictureUrl, documentFrontUrl, documentBackUrl] = await Promise.all([
//       uploadToCloudinary(req.files?.profilePicture[0], 'profile-pictures'),
//       // req.files?.resume ? uploadToCloudinary(req.files?.resume[0], 'resumes') : Promise.resolve(null),
//       // req.files?.characterCertificate ? uploadToCloudinary(req.files?.characterCertificate[0], 'character-certificates') : Promise.resolve(null),
//       req.files['document.front'] ? uploadToCloudinary(req.files['document.front'][0], 'document-front') : Promise.resolve(null), // <-- Fix
//       req.files['document.back'] ? uploadToCloudinary(req.files['document.back'][0], 'document-back') : Promise.resolve(null)  // <-- Fix
//     ]);


//     // Function to parse JSON arrays safely
//     const parseJsonArray = (field) => {
//       try {
//         return JSON.parse(req.body[field] || '[]');
//       } catch {
//         return [];
//       }
//     };

//     // Create chef document
//     const newChef = new db.Chef({
//       name: req.body.name,
//       gender: req.body.gender || null,
//       profilePicture: profilePictureUrl || null,
//       // resume: resumeUrl || null,
//       // characterCertificate: characterCertificateUrl,
//       canCook: JSON.parse(req.body.canCook || 'false'),
//       previousWorkplace: parseJsonArray('previousWorkplace'),
//       readyForHomeKitchen: JSON.parse(req.body.readyForHomeKitchen || 'false'),
//       preferredCities: parseJsonArray('preferredCities'),
//       currentCity: req.body.currentCity,
//       currentArea: req.body.currentArea,
//       cuisines: parseJsonArray('cuisines'),
//       travelMode: req.body.travelMode,
//       cooksNonVeg: JSON.parse(req.body.cooksNonVeg || 'false'),
//       readingLanguage: req.body.readingLanguage,
//       experienceYears: req.body.experienceYears,
//       currentSalary: parseFloat(req.body.currentSalary) || 0,
//       businessName: req.body.businessName,
//       address: req.body.address ? JSON.parse(req.body.address) : null,
//       PhoneNo: "+91" + req.body.PhoneNo || null,
//       document: {
//         type: req.body.documentType || null,
//         documentNo: req.body.documentNo || null,
//         docsPhoto: {
//           front: documentFrontUrl,
//           back: documentBackUrl
//         }
//       },
//       verificationStatus: req.body.verificationStatus || 'Pending',
//     });

//     // Save chef
//     const savedChef = await newChef.save();

//     // Prepare response
//     const response = sendSuccessApiResponse("Chef created successfully", {
//       chef: {
//         id: savedChef._id,
//         ...savedChef.toObject(),
//       },
//     });

//     res.status(201).send(response);
//   } catch (error) {
//     console.error("Error in createChef:", error);
//     next(error);
//   }
// };

const deleteChef = async (req, res, next) => {
  try {
    const { chefId } = req.params;
    console.log("gell", chefId)

    // Find and delete the chef
    const deletedChef = await db.Chef.findByIdAndDelete(chefId);

    // Check if chef exists
    if (!deletedChef) {
      return next(createCustomError('Chef not found', 404));
    }
    await db.Order.updateMany(
      { chef: chefId },
      { $set: { chef: null } }
    );
    // Delete associated files from Cloudinary (optional but recommended)
    // const cloudinaryDeletionPromises = [
    //   deleteFromCloudinary(deletedChef.profilePicture),
    //   deleteFromCloudinary(deletedChef.resume),
    //   deleteFromCloudinary(deletedChef.characterCertificate)
    // ];

    // // Wait for Cloudinary deletions to complete (non-blocking)
    // Promise.allSettled(cloudinaryDeletionPromises);

    // Prepare response
    const response = sendSuccessApiResponse("Chef deleted successfully", {
      chef: {
        id: deletedChef._id,
        name: deletedChef.name
      }
    });

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

// const loginChef = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // Check if chef exists
//     const chef = await db.Chef.findOne({ email });
//     if (!chef) {
//       return next(createCustomError("Invalid credentials", 401));
//     }

//     // Check if chef is active
//     if (!chef.isActive) {
//       return next(createCustomError("Account is deactivated", 403));
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, chef.password);
//     if (!isPasswordValid) {
//       return next(createCustomError("Invalid credentials", 401));
//     }

//     // Create JWT token
//     const token = jwt.sign({ id: chef._id }, process.env.JWT_SECRET, {
//       expiresIn: "24h",
//     });

//     const response = sendSuccessApiResponse("Login successful", {
//       chef: {
//         id: chef._id,
//         firstname: chef.firstname,
//         lastname: chef.lastname,
//         email: chef.email,
//         experience: chef.experience,
//         rating: chef.rating,
//         speciality: chef.speciality,
//         isActive: chef.isActive,
//       },
//       token,
//     });

//     res.status(200).send(response);
//   } catch (error) {
//     next(error);
//   }
// };

// Send OTP for verification


const sendOtp = async (req, res) => {
  console.log("ssssssssssssssssssssssss:", verifySid)
  try {
    const { PhoneNo } = req.body;

    if (!PhoneNo.startsWith('+')) {
      return res.status(400).json({ error: "Phone number must be in E.164 format (e.g., +1234567890)" });
    }

    const user = await db.Chef.findOne({ PhoneNo });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check verification status
    if (user.verificationStatus === 'Pending' || user.verificationStatus === 'Rejected') {
      return res.status(403).json({ message: 'User is not verified. OTP cannot be sent.' });
    }

    // Send OTP via Twilio Verify API
    const verification = await client.verify.v2.services(verifySid)
      .verifications
      .create({ to: PhoneNo, channel: 'sms' });

    res.json({ message: "OTP sent successfully", });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { PhoneNo, otp } = req.body;

    // Verify OTP using Twilio
    const verificationCheck = await client.verify.v2.services(verifySid)
      .verificationChecks
      .create({ to: PhoneNo, code: otp });

    if (verificationCheck.status === 'approved') {
      const user = await db.Chef.findOne({ PhoneNo }).populate("orders");;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = jwt.sign(
        { id: user._id, PhoneNo: user.PhoneNo },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "OTP verified successfully",
        token: token,

      });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateChefProfile = async (req, res, next) => {
  try {
    const { firstname, lastname, experience, rating, speciality, isActive } =
      req.body;

    const chefId = req.chef._id; // Assuming you have middleware that sets chef info

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return next(createCustomError("Rating must be between 0 and 5", 400));
    }

    // Validate speciality if provided
    const validSpecialities = [
      "Vegetarian",
      "Vegan",
      "Keto",
      "Low-Carb",
      "Gluten-Free",
    ];
    if (speciality) {
      if (!Array.isArray(speciality)) {
        return next(createCustomError("Speciality must be an array", 400));
      }
      const invalidSpecialities = speciality.filter(
        (s) => !validSpecialities.includes(s)
      );
      if (invalidSpecialities.length > 0) {
        return next(
          createCustomError(
            `Invalid specialities: ${invalidSpecialities.join(", ")}`,
            400
          )
        );
      }
    }

    const updatedChef = await db.Chef.findByIdAndUpdate(
      chefId,
      {
        firstname,
        lastname,
        experience,
        rating,
        speciality,
        isActive,
      },
      { new: true }
    ).select("-password");

    if (!updatedChef) {
      return next(createCustomError("Chef not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Chef profile updated successfully",
      updatedChef
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

const updateVerificationStatus = async (req, res, next) => {
  try {
    const { verificationStatus, chefId } = req.body;
    if (!chefId || !verificationStatus) {
      return res.status(400).json({ message: "chefId and verificationStatus are required." });
    }

    if (!["Pending", "Verified", "Rejected"].includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status." });
    }

    const updatedChef = await db.Chef.findByIdAndUpdate(
      chefId,
      { verificationStatus },
      { new: true }
    );

    if (!updatedChef) {
      return res.status(404).json({ message: "Chef not found." });
    }

    res.status(200).json({
      message: "Verification status updated successfully.",
      data: updatedChef,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    next(error); // Error handling middleware ko bhejne ke liye
  }
};




const getChefDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const chef = await db.Chef.findOne({ _id: userId });
    // let userDetails = await db.UserDetails.findOne({
    //   userID: userId,
    // });
    // const order = await db.Order.findOne({user: userId,planID:user.activePlan})
    if (!chef) {
      return next(createCustomError("Chef details not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Chef details retrieved successfully",
      { chef }
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}

const getChefById = async (req, res) => {
  try {
    const user = await db.Chef.findById(req.params.id).populate("orders");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createChefByApp = async (req, res, next) => {
  try {
    const {
      fullName,
      businessName,
      address,
      PhoneNo,
      chefServices,
      homemakerServices,
      documentType,
      documentNo,
      profilePic,
      documentFront,
      documentBack
    } = req.body;

    // Validate required fields
    if (!fullName || !businessName || !address || !PhoneNo || !documentType || 
        !documentNo || !profilePic || !documentFront || !documentBack) {
      return next(createCustomError("Please provide all required fields", 400));
    }

    // Validate phone number format
    if (!PhoneNo.startsWith('+')) {
      return next(createCustomError("Phone number must be in E.164 format (e.g., +919871543210)", 400));
    }

    // Check if chef with same phone number exists
    const existingChef = await db.Chef.findOne({ PhoneNo });
    if (existingChef) {
      return next(createCustomError("Chef with this phone number already exists", 400));
    }

    // Create new chef
    const newChef = new db.Chef({
      name: fullName,
      businessName,
      address: {
        address1: address.address1,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      },
      PhoneNo,
      chefServices: chefServices || [],
      homemakerServices: homemakerServices || false,
      document: {
        type: documentType,
        documentNo: documentNo,
        docsPhoto: {
          front: documentFront,
          back: documentBack
        }
      },
      profilePicture: profilePic,
      verificationStatus: 'Pending'
    });

    await newChef.save();

    const response = sendSuccessApiResponse(
      "Chef profile created successfully",
      {
        chef: {
          id: newChef._id,
          name: newChef.name,
          businessName: newChef.businessName,
          PhoneNo: newChef.PhoneNo,
          verificationStatus: newChef.verificationStatus,
          homemakerServices: newChef.homemakerServices
        }
      }
    );

    return res.status(201).send(response);

  } catch (error) {
    console.error('Error creating chef:', error);
    if (error.name === 'ValidationError') {
      return next(createCustomError(error.message, 400));
    }
    return next(createCustomError("Error creating chef profile", 500));
  }
};

const userController = {
  updateUser,
  createOrUpdateUserDetails,
  getAllUsers,
  getUserDetails,
  searchUsers,
  getAllChefs,
  searchChefs,
  LoginAdmin,
  createAdmin,
  createChef,
  updateVerificationStatus,
  sendOtp,
  verifyOtp,
  updateChefProfile,
  getChefDetails,
  deleteChef,
  getChefById,
  createChefByApp
};

// loginChef,

export default userController;
