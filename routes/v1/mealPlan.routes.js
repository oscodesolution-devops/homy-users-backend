import express from "express";
const router = express.Router();

// import controllers
import { isLoggedIn } from "../../middlewares/authorization.js";
import controllers from "../../controllers/index.js";

// Route to create or update a meal plan for a specific date and meal type
router.route("/create").post(isLoggedIn, controllers.mealPlanController.createMealPlan);

// Route to get the last 30 meal plans for the logged-in user
router.route("/get").get(isLoggedIn, controllers.mealPlanController.getUserMealPlans);

// Route to update a specific meal plan for a given date and meal type
router.route("/update").put(isLoggedIn, controllers.mealPlanController.updateMealPlan);

// Route to delete a whole meal plan document based on date
router.route("/delete").delete(isLoggedIn, controllers.mealPlanController.deleteMealPlan);

// Route to delete a specific meal type from a meal plan based on date and meal type
router.route("/delete-meal").delete(isLoggedIn, controllers.mealPlanController.deleteMealType);

// Route to get meal plan for a specific user
router.route("/user/:userId").get(controllers.mealPlanController.getUserMealPlanById);

export default router;
