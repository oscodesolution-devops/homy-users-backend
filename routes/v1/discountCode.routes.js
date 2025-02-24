import express from "express";
const router = express.Router();

// Import controllers
import controllers from "../../controllers/index.js";
import { isLoggedIn } from "../../middlewares/authorization.js";

// Route to get all discount codes
router.route("/get").get(isLoggedIn, controllers.discountCodeController.getAllDiscountCodes);

// Route to get a specific discount code by ID
router.route("/get/:discountCodeId").get(isLoggedIn, controllers.discountCodeController.getDiscountCodeById);

// Route to create a new discount code
router.route("/create").post(controllers.discountCodeController.createDiscountCode);

// Route to update an existing discount code
router.route("/update/:discountCodeId").put(controllers.discountCodeController.updateDiscountCode);

// Route to delete a discount code
router.route("/delete/:discountCodeId").delete(controllers.discountCodeController.deleteDiscountCode);

export default router;
