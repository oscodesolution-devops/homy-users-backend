import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";

const createPlan = async (req, res, next) => {
  const { type, morningPrice, description, eveningPrice, servesUpto, extraPersonCharge ,features} =
    req.body;
  if (
    !(type && morningPrice && eveningPrice && servesUpto && extraPersonCharge && features.length)
  ) {
    return next(createCustomError("Please Enter all the valid fields", 404));
  }
  try {
    // Check if plan with same type already exists
    const existingPlan = await db.Plan.findOne({ type });
    if (existingPlan) {
      return next(createCustomError("Plan with this type already exists", 400));
    }

    const newPlan = new db.Plan({
      type,
      morningPrice,
      description,
      features,
      eveningPrice,
      servesUpto,
      extraPersonCharge,
    });

    await newPlan.save();
    const response = sendSuccessApiResponse(
      "Plan created successfully",
      newPlan
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const updatePlan = async (req, res, next) => {
  const { planId } = req.params;
  const { type, morningPrice, description,eveningPrice, servesUpto, extraPersonCharge,features } =
    req.body;
  if (!planId) {
    return next(createCustomError("Plan Id is required to update", 404));
  }
  try {
    // If type is being updated, check if new type already exists
    if (type) {
      const existingPlan = await db.Plan.findOne({
        type,
        _id: { $ne: planId },
      });

      if (existingPlan) {
        return next(
          createCustomError("Plan with this type already exists", 400)
        );
      }
    }

    const updatedPlan = await db.Plan.findByIdAndUpdate(
      planId,
      {
        type,
        morningPrice,
        eveningPrice,
        description,
        features,
        servesUpto,
        extraPersonCharge,
      },
      { new: true }
    );

    if (!updatedPlan) {
      return next(createCustomError("Plan Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Plan updated successfully",
      updatedPlan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getAllPlans = async (req, res, next) => {
  try {
    const plans = await db.Plan.find({});
    const response = sendSuccessApiResponse(
      "Plans retrieved successfully",
      plans
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getPlanById = async (req, res, next) => {
  const { planId } = req.params;
  if (!planId) {
    return next(createCustomError("Plan Id is required to update", 404));
  }
  try {
    const plan = await db.Plan.findById(planId);

    if (!plan) {
      return next(createCustomError("Plan Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Plan retrieved successfully",
      plan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const deletePlan = async (req, res, next) => {
  const { planId } = req.params;
  if (!planId) {
    return next(createCustomError("Plan Id is required to update", 404));
  }
  try {
    const users = await db.User.find({activePlan:planId})
    if(users.length){
      users.map(async(user)=>{
        user.activePlan=null;
        await user.save()
      })
    }
    const deletedPlan = await db.Plan.findByIdAndDelete(planId);

    if (!deletedPlan) {
      return next(createCustomError("Plan Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Plan deleted successfully",
      deletedPlan
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};



const planController = {
  createPlan,
  updatePlan,
  getAllPlans,
  getPlanById,
  deletePlan,
};

export default planController;
