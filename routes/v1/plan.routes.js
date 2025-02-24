import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { hasAdminAccess, isLoggedIn } from "../../middlewares/authorization.js";

router.route("/get").get(controllers.planController.getAllPlans);
router.route("/get/:planId'").get(isLoggedIn,controllers.planController.getPlanById);
router.route("/create").post(hasAdminAccess,controllers.planController.createPlan);
router.route("/delete/:planId").delete(hasAdminAccess,controllers.planController.deletePlan);
router.route("/update/:planId").put(hasAdminAccess,controllers.planController.updatePlan);
export default router;
