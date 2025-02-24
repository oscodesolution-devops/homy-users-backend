import express from "express";
const router = express.Router();

// import controllers
import controllers from "../../controllers/index.js";
import { hasAdminAccess } from "../../middlewares/authorization.js";

router.route("/create").post(controllers.queryController.createQuery);
router.route("/get").get(hasAdminAccess,controllers.queryController.getAllQueries);
router.route("/update/:queryId").put(hasAdminAccess,controllers.queryController.updateQueryStatus);
router.route("/delete/:queryId").delete(hasAdminAccess,controllers.queryController.deleteQuery);


export default router;