import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { hasAdminAccess } from "../../middlewares/authorization.js";
import { handleFileUploadErrors, uploadFiles } from "../../middlewares/upload.js";
router.route("/create").post(controllers.userController.createAdmin);
router.route("/login").post(controllers.userController.LoginAdmin);
router.route("/dashboard").get(hasAdminAccess, controllers.applicationController.getDashboardData);
router.route("/sales").get(hasAdminAccess, controllers.applicationController.getSalesData);
router.route("/users").get(hasAdminAccess, controllers.userController.getAllUsers);
router.route("/users/:userId").get(hasAdminAccess, controllers.userController.getUserDetails);
router.route("/users/search").get(hasAdminAccess, controllers.userController.searchUsers);
router.route("/chefs").get(hasAdminAccess, controllers.userController.getAllChefs);
router.route("/meal-schedule").post(hasAdminAccess, controllers.mealPlanController.getAdminUserMealPlan);
// router.route("/chefs").post(hasAdminAccess,controllers.userController.getAllChefs);
// router.route("/chef").post(hasAdminAccess,controllers.userController.createChef);
router.route("/chef").post(hasAdminAccess, uploadFiles, handleFileUploadErrors, controllers.userController.createChef);
router.route("/createchef").post(uploadFiles, handleFileUploadErrors, controllers.userController.createChef);
// router.route("/createchefforpartner").post(uploadFilesforpatner, handleFileUploadErrors, controllers.userController.createChefForPartnerApp);
// router.route("/chef").post(controllers.userController.loginChef);
router.route("/sendOtpForChef").post(controllers.userController.sendOtp);
router.route("/verifyOtpForLoginChef").post(controllers.userController.verifyOtp);


router.route("/chef").put(hasAdminAccess, controllers.userController.updateChefProfile);
router.route("/chef/:userId").get(hasAdminAccess, controllers.userController.getChefDetails);
router.route("/chefById/:userId").get( controllers.userController.getChefById);
router.route("/chef/:chefId").delete(hasAdminAccess, controllers.userController.deleteChef);
router.route("/updateVerificationStatusChef").post(hasAdminAccess, controllers.userController.updateVerificationStatus);



// router.route("/chefs/:chefId").get(controllers.userController.);
router.route("/chefs/search").get(hasAdminAccess, controllers.userController.searchChefs);
// router.route("/chefs").get(control);
router.route("/orders").get(hasAdminAccess, controllers.orderController.getAllOrders);

// router.route("/chefs/:chefId/orders").get(controllers.orderController);

router.route("/orders/:orderId/assign-chef").post(hasAdminAccess, controllers.orderController.assignChefToOrder);

router.route("/orders/chefId").get(hasAdminAccess, controllers.orderController.getAllOrders);
router.route("/query").get(hasAdminAccess, controllers.queryController.getAllQueries);
router.route("/query/:queryId").get(hasAdminAccess, controllers.queryController.getQueryById)
router.route("/query/:queryId").delete(hasAdminAccess, controllers.queryController.deleteQuery)
router.route("/query/:queryId").put(hasAdminAccess, controllers.queryController.updateQueryStatus);

export default router;
