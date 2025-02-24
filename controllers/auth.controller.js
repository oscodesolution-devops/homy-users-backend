import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOtp, verifyFirebaseOtp } from "../services/otpService.js";

const auth = async (req, res, next) => {
  const { phoneNumber, uid } = req.body;

  if (!phoneNumber && !uid) {
    return next(createCustomError("Please Provide Phone Number and Uid", 404));
  }

  try {
    const existingUser = await db.User.findOne({
      phoneNumber: phoneNumber,
      uid: uid,
    });
    if (existingUser) {
      const accessToken = jwt.sign(
        {
          userId: existingUser._id,
          phoneNumber: existingUser.phoneNumber,
          uid: existingUser.uid,
        },
        process.env.JWT_SECRET
      );
      const response = sendSuccessApiResponse(
        "OTP sent successfully",
        {existingUser,accessToken}
      );
      return res.status(200).send(response);
    } else {
      const user = new db.User({
        phoneNumber,
        uid,
      });
      await user.save();
      const accessToken = jwt.sign(
        {
          userId: user._id,
          phoneNumber: user.phoneNumber,
          uid: user.uid,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );
     
        const response = sendSuccessApiResponse("OTP sent successfully", {user,accessToken});
        return res.status(200).send(response);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { phoneNumber, uid } = req.body;
  try {
    const existingUser = await db.User.findOne({
      phoneNumber: phoneNumber,
      uid: uid,
    });
    if (!existingUser) {
      return next(createCustomError("No User found", 404));
    }
    const accessToken = jwt.sign(
      {
        userId: existingUser._id,
        phoneNumber: existingUser.phoneNumber,
        uid: existingUser.uid,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    const response = sendSuccessApiResponse("OTP Verified successfully", {
      user,
      accessToken,
    });
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const registerEmployee = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, location, bio, roleId, password } =
      req.body;

    // Check if employee already exists
    const existingEmployee = await db.Employee.findOne({ email });
    if (existingEmployee) {
      return next(
        createCustomError("Employee already exists with this email", 400)
      );
    }

    // Check if role exists
    const role = await db.Role.findById(roleId);
    if (!role) {
      return next(createCustomError("Invalid role", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const newEmployee = new db.Employee({
      fullName,
      email,
      phoneNumber,
      location,
      bio,
      role: roleId,
      password: hashedPassword,
      employedOn: new Date(),
    });

    await newEmployee.save();
    const response = sendSuccessApiResponse(
      "Employee registered successfully",
      newEmployee
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if employee exists
    const employee = await db.Employee.findOne({ email }).populate("role");
    if (!employee) {
      return next(createCustomError("Invalid credentials", 400));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return next(createCustomError("Invalid credentials", 400));
    }

    // Create and sign JWT
    const payload = {
      employee: {
        id: employee._id,
        role: employee.role.name, // Assuming the role has a 'name' field
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;

        const response = sendSuccessApiResponse(
          "Employee login successfully",
          token
        );
        return res.status(200).send(response);
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const authController = { auth, verifyOtp };
export default authController;
