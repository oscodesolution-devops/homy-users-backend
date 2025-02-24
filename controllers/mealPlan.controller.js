import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js"; // Assuming `MealPlan` is a part of your models

// 1. Post meal schedule
const createMealPlan = async (req, res, next) => {
  const { date, mealSchedule } = req.body;
  const { type } = req.query;
  const userId = req.user._id;

  if (!date || !type || !mealSchedule) {
    return next(createCustomError("Please provide all required fields", 404));
  }

  try {
    // Normalize the date to start of day in UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // First try to find the existing document
    let mealPlan = await db.MealPlan.findOne({
      userId,
      date: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (mealPlan) {
      // Update existing document
      mealPlan = await db.MealPlan.findOneAndUpdate(
        { _id: mealPlan._id },
        { 
          $set: { 
            [`mealSchedule.${type}`]: mealSchedule 
          } 
        },
        { new: true }
      );
    } else {
      // Create new document
      mealPlan = await db.MealPlan.create({
        userId,
        date: normalizedDate,
        mealSchedule: {
          [type]: mealSchedule
        }
      });
    }

    const response = sendSuccessApiResponse(
      "Meal Plan created/updated successfully",
      mealPlan
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
// 2. Get meal schedule for each user (last 30 documents)
const getUserMealPlans = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const mealPlans = await db.MealPlan.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    const response = sendSuccessApiResponse(
      "Meal Plans retrieved successfully",
      mealPlans
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// 3. Update meal plan for a specific date
const updateMealPlan = async (req, res, next) => {
  const { date, mealSchedule } = req.body;
  const { type } = req.query;
  const userId = req.user._id;

  if (!date || !type || !mealSchedule) {
    return next(createCustomError("Please provide all required fields", 404));
  }

  try {
    const updatedMealPlan = await db.MealPlan.findOneAndUpdate(
      { userId, date },
      { $set: { [`mealSchedule.${type}`]: mealSchedule } },
      { new: true }
    );

    if (!updatedMealPlan) {
      return next(createCustomError("Meal Plan not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Meal Plan updated successfully",
      updatedMealPlan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// 4. Delete whole meal plan document
const deleteMealPlan = async (req, res, next) => {
  const { date } = req.body;
  const userId = req.user._id;

  if (!date) {
    return next(createCustomError("Date is required to delete", 404));
  }

  try {
    const deletedMealPlan = await db.MealPlan.findOneAndDelete({ userId, date });

    if (!deletedMealPlan) {
      return next(createCustomError("Meal Plan not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Meal Plan deleted successfully",
      deletedMealPlan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// 5. Delete a specific meal type from meal schedule
const deleteMealType = async (req, res, next) => {
  const { date } = req.body;
  const { type } = req.query;
  const userId = req.user._id;

  if (!date || !type) {
    return next(createCustomError("Date and meal type are required to delete", 404));
  }

  try {
    const updatedMealPlan = await db.MealPlan.findOneAndUpdate(
      { userId, date },
      { $unset: { [`mealSchedule.${type}`]: "" } },
      { new: true }
    );

    if (!updatedMealPlan) {
      return next(createCustomError("Meal Plan or meal type not found", 404));
    }

    const response = sendSuccessApiResponse(
      "Meal type deleted successfully",
      updatedMealPlan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getAdminUserMealPlan = async (req, res, next) => {
  const { userId, date } = req.body;

  // Validate input
  if (!userId || !date) {
    return next(createCustomError("Please provide both userId and date", 400));
  }

  try {
    // Normalize the date to start of day in UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Find the meal plan for the specific user and date
    const mealPlan = await db.MealPlan.findOne({
      userId,
      date: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // If no meal plan found, return appropriate response
    if (!mealPlan) {
      const response = sendSuccessApiResponse(
        "No meal plan found for this date",
        null
      );
      return res.status(200).send(response);
    }

    // Return the meal schedule
    const response = sendSuccessApiResponse(
      "Meal Plan retrieved successfully",
      mealPlan.mealSchedule
    );
    console.log(response)
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};


const mealPlanController = {
  getAdminUserMealPlan,
  createMealPlan,
  getUserMealPlans,
  updateMealPlan,
  deleteMealPlan,
  deleteMealType,
};

export default mealPlanController;
