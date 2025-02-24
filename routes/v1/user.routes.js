import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { hasAdminAccess, isLoggedIn } from "../../middlewares/authorization.js";

router.route("/update-user").post(isLoggedIn,controllers.userController.updateUser);
router.route("/update-user-details").post(isLoggedIn,controllers.userController.createOrUpdateUserDetails);
router.route("/").get(isLoggedIn,controllers.userController.getUserDetails)
// router.route("/:userId").get(hasAdminAccess,controllers.userController.getUserDetails)

export default router;
