import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { isLoggedIn } from "../../middlewares/authorization.js";

router.route("/get").get(isLoggedIn,controllers.notificationController.getAllNotifications);
router.route("/get/:notificationId'").get(isLoggedIn,controllers.notificationController.getNotificationById);
router.route("/create").post(controllers.notificationController.createNotification);
export default router;
