import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { isLoggedIn } from "../../middlewares/authorization.js";

// Get all coupons
router.route("/get").get(isLoggedIn, controllers.couponController.getAllCoupons);

// Get coupon by ID
router.route("/get/:couponId").get(isLoggedIn, controllers.couponController.getCouponById);

// Get coupons for a specific plan
router.route("/plan/:planId").get(isLoggedIn, controllers.couponController.getCouponsByPlanId);

// Create a new coupon
router.route("/create").post(isLoggedIn, controllers.couponController.createCoupon);

// Update an existing coupon
router.route("/update/:couponId").patch(isLoggedIn, controllers.couponController.updateCoupon);

// Deactivate a coupon
router.route("/deactivate/:couponId").patch(isLoggedIn, controllers.couponController.deactivateCoupon);

export default router;