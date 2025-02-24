import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";

router.route("/").post(controllers.authController.auth);
router.route("/verify-otp").post(controllers.authController.verifyOtp);

export default router;
