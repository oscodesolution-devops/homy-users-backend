import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";

const createCoupon = async (req, res, next) => {
  const { 
    code, 
    description, 
    discountType, 
    discountValue, 
    maxDiscount, 
    applicablePlans,
    isActive 
  } = req.body;

  // Validate required fields
  if (!(code && discountType && discountValue && applicablePlans)) {
    return next(createCustomError("Please provide all required coupon fields", 400));
  }

  try {
    // Check if coupon with same code already exists
    const existingCoupon = await db.Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return next(createCustomError("Coupon with this code already exists", 400));
    }

    // Validate that all plans exist
    const plansExist = await db.Plan.find({ 
      _id: { $in: applicablePlans } 
    });
    
    if (plansExist.length !== applicablePlans.length) {
      return next(createCustomError("One or more plans do not exist", 400));
    }

    const newCoupon = new db.Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      applicablePlans,
      isActive: isActive !== undefined ? isActive : true
    });

    await newCoupon.save();
    const response = sendSuccessApiResponse(
      "Coupon created successfully", 
      newCoupon
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error creating coupon", 500));
  }
};

const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { 
    code, 
    description, 
    discountType, 
    discountValue, 
    maxDiscount, 
    applicablePlans,
    isActive 
  } = req.body;

  if (!couponId) {
    return next(createCustomError("Coupon Id is required", 400));
  }

  try {
    // Check if coupon exists
    const existingCoupon = await db.Coupon.findById(couponId);
    if (!existingCoupon) {
      return next(createCustomError("Coupon not found", 404));
    }

    // Validate plans if provided
    if (applicablePlans) {
      const plansExist = await db.Plan.find({ 
        _id: { $in: applicablePlans } 
      });
      
      if (plansExist.length !== applicablePlans.length) {
        return next(createCustomError("One or more plans do not exist", 400));
      }
    }

    // Check for unique code
    if (code) {
      const codeExists = await db.Coupon.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: couponId } 
      });
      if (codeExists) {
        return next(createCustomError("Coupon code already exists", 400));
      }
    }

    const updateData = {
      ...(code && { code: code.toUpperCase() }),
      ...(description && { description }),
      ...(discountType && { discountType }),
      ...(discountValue && { discountValue }),
      ...(maxDiscount && { maxDiscount }),
      ...(applicablePlans && { applicablePlans }),
      ...(isActive !== undefined && { isActive })
    };

    const updatedCoupon = await db.Coupon.findByIdAndUpdate(
      couponId, 
      updateData, 
      { new: true }
    );

    const response = sendSuccessApiResponse(
      "Coupon updated successfully", 
      updatedCoupon
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error updating coupon", 500));
  }
};

const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await db.Coupon.find({}).populate('applicablePlans');
    const response = sendSuccessApiResponse(
      "Coupons retrieved successfully", 
      coupons
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error retrieving coupons", 500));
  }
};

const getCouponsByPlanId = async (req, res, next) => {
  const { planId } = req.params;

  if (!planId) {
    return next(createCustomError("Plan Id is required", 400));
  }

  try {
    const coupons = await db.Coupon.find({ 
      applicablePlans: planId 
    }).populate('applicablePlans');

    const response = sendSuccessApiResponse(
      "Coupons for plan retrieved successfully", 
      coupons
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error retrieving plan coupons", 500));
  }
};

const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;

  if (!couponId) {
    return next(createCustomError("Coupon Id is required", 400));
  }

  try {
    const coupon = await db.Coupon.findById(couponId).populate('applicablePlans');

    if (!coupon) {
      return next(createCustomError("Coupon not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Coupon retrieved successfully", 
      coupon
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error retrieving coupon", 500));
  }
};

const deactivateCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  if (!couponId) {
    return next(createCustomError("Coupon Id is required", 400));
  }

  try {
    const coupon = await db.Coupon.findById(couponId);

    if (!coupon) {
      return next(createCustomError("Coupon not found", 404));
    }

    coupon.isActive = false;
    await coupon.save();

    const response = sendSuccessApiResponse(
      "Coupon deactivated successfully", 
      coupon
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return next(createCustomError("Error deactivating coupon", 500));
  }
};

const couponController = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponsByPlanId,
  getCouponById,
  deactivateCoupon
};

export default couponController;