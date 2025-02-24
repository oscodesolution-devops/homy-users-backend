import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";

// Create a new discount code
const createDiscountCode = async (req, res, next) => {
  const { code, discountAmount, startDate, endDate } = req.body;

  if (!code || !discountAmount || !startDate || !endDate) {
    return next(createCustomError("Please provide all required fields", 400));
  }

  try {
    const newDiscountCode = new db.DiscountCode({
      code,
      discountAmount,
      startDate,
      endDate,
    });

    await newDiscountCode.save();
    const response = sendSuccessApiResponse("Discount code created successfully", newDiscountCode);
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error creating discount code", 500));
  }
};

// Update an existing discount code
const updateDiscountCode = async (req, res, next) => {
  const { discountCodeId } = req.params;
  const { code, discountAmount, startDate, endDate, isActive } = req.body;

  if (!discountCodeId) {
    return next(createCustomError("Discount code ID is required", 400));
  }

  try {
    const updatedDiscountCode = await db.DiscountCode.findByIdAndUpdate(
      discountCodeId,
      { code, discountAmount, startDate, endDate, isActive },
      { new: true }
    );

    if (!updatedDiscountCode) {
      return next(createCustomError("Discount code not found", 404));
    }

    const response = sendSuccessApiResponse("Discount code updated successfully", updatedDiscountCode);
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error updating discount code", 500));
  }
};

// Get all discount codes
const getAllDiscountCodes = async (req, res, next) => {
  try {
    const discountCodes = await db.DiscountCode.find({});
    const response = sendSuccessApiResponse("Discount codes retrieved successfully", discountCodes);
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error retrieving discount codes", 500));
  }
};

// Get discount code by ID
const getDiscountCodeById = async (req, res, next) => {
  const { discountCodeId } = req.params;

  if (!discountCodeId) {
    return next(createCustomError("Discount code ID is required", 400));
  }

  try {
    const discountCode = await db.DiscountCode.findById(discountCodeId);
    if (!discountCode) {
      return next(createCustomError("Discount code not found", 404));
    }

    const response = sendSuccessApiResponse("Discount code retrieved successfully", discountCode);
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error retrieving discount code", 500));
  }
};

// Delete a discount code
const deleteDiscountCode = async (req, res, next) => {
  const { discountCodeId } = req.params;

  if (!discountCodeId) {
    return next(createCustomError("Discount code ID is required", 400));
  }

  try {
    const deletedDiscountCode = await db.DiscountCode.findByIdAndDelete(discountCodeId);
    if (!deletedDiscountCode) {
      return next(createCustomError("Discount code not found", 404));
    }

    const response = sendSuccessApiResponse("Discount code deleted successfully", deletedDiscountCode);
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error deleting discount code", 500));
  }
};

const discountCodeController = {
  createDiscountCode,
  updateDiscountCode,
  getAllDiscountCodes,
  getDiscountCodeById,
  deleteDiscountCode,
};

export default discountCodeController;
