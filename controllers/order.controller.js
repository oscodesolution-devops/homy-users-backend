import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";
import {
  generateRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/razorpay.js";

const orderController = {
  // Generate a new order
  generateOrder: async (req, res, next) => {
    const {
      planType,
      totalPeople,
      morningMealTime,
      eveningMealTime,
      chefDayOff,
      planStartDate,
      specialInstruction,
      baseAmount,
      extraPersonAmount,
      discountAmount,
      totalAmount, // total amount will be updated on the frontend
    } = req.body;

    const userId = req.user._id;

    if (
      !(
        planType &&
        !isNaN(totalPeople) &&
        (morningMealTime || eveningMealTime) &&
        chefDayOff &&
        planStartDate &&
        !isNaN(baseAmount) &&
        !isNaN(extraPersonAmount) &&
        !isNaN(discountAmount) &&
        !isNaN(totalAmount)
      )
    ) {
      return next(createCustomError("Please enter all the valid fields", 404));
    }

    try {
      // Generate the Razorpay order
      const razorpayOrderResponse = await generateRazorpayOrder(totalAmount);

      const order = new db.Order({
        user: userId,
        planID: planType,
        totalPeople,
        morningMealTime,
        eveningMealTime,
        chefDayOff,
        planStartDate,
        specialInstruction,
        baseAmount,
        extraPersonAmount,
        discountAmount,
        totalAmount,
        razorpayOrderId: razorpayOrderResponse.id,
      });

      await order.save();
      const response = sendSuccessApiResponse(
        "Order created successfully",
        order
      );
      return res.status(201).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Confirm an order
  confirmOrder: async (req, res, next) => {
    const { orderId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      const order = await db.Order.findOneAndUpdate(
        { _id: orderId, status: "pending" },
        {
          status: "failed",
        },
        { new: true }
      );
      if (!order) {
        return next(
          createCustomError("Order not found or already confirmed", 404)
        );
      }

      const response = sendSuccessApiResponse(
        "Order confirmed successfully",
        order
      );
      return res.status(200).send(response);
    }

    try {
      // Verify the Razorpay signature
      const isValid = await verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return next(createCustomError("Invalid Razorpay signature", 400));
      }

      console.log(orderId);
      // Update the order status
      const order = await db.Order.findOneAndUpdate(
        { _id: orderId, status: "pending" },
        {
          status: "confirmed",
          razorpayPaymentId,
          razorpaySignature,
        },
        { new: true }
      );

      if (!order) {
        return next(
          createCustomError("Order not found or already confirmed", 404)
        );
      }

      await db.User.findOneAndUpdate(
        {_id: order.user},
        {
          activePlan: order.planID
        },
        { new: true}
      )

      const response = sendSuccessApiResponse(
        "Order confirmed successfully",
        order
      );
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Get a single order by ID
  getOrderById: async (req, res, next) => {
    const { orderId } = req.params;

    if (!orderId) {
      return next(createCustomError("Order ID is required", 404));
    }

    try {
      const order = await db.Order.findById(orderId).populate(
        "user",
        "name email"
      );

      if (!order) {
        return next(createCustomError("Order not found", 404));
      }

      const response = sendSuccessApiResponse(
        "Order retrieved successfully",
        order
      );
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Get all orders for the logged-in user
  getUserOrders: async (req, res, next) => {
    const userId = req.user._id;

    try {
      const orders = await db.Order.find({ user: userId }).populate(
        "user",
        "firstName lastName email"
      );
      const response = sendSuccessApiResponse(
        "User orders retrieved successfully",
        orders
      );
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  getAllOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || ""; // Get the search query from request
      const startIndex = (page - 1) * limit;

      // Create a search filter
      const searchFilter = search 
        ? {
            $or: [
              { orderNumber: { $regex: search, $options: 'i' } },
              { 'user.firstName': { $regex: search, $options: 'i' } },
              { 'user.lastName': { $regex: search, $options: 'i' } },
              { 'chef.firstname': { $regex: search, $options: 'i' } },
              { 'chef.lastname': { $regex: search, $options: 'i' } },
              { status: { $regex: search, $options: 'i' } }
            ]
          }
        : {};

      // Count total orders matching the filter
      const total = await db.Order.countDocuments(searchFilter);

      // Fetch filtered and paginated orders
      const orders = await db.Order.find(searchFilter)
        .skip(startIndex)
        .limit(limit)
        .populate("user", "firstName lastName -_id")
        .populate("chef", "name -_id");
      // Construct the response
      const response = sendSuccessApiResponse("Orders retrieved successfully", {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });      

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: "An error occurred." });
    }
  },
  assignChefToOrder: async (req, res) => {
    const { orderId } = req.params;
    const { chefId } = req.body;
    try {
      const order = await db.Order.findByIdAndUpdate(
        orderId,
        { chef: chefId },
        { new: true }
      );
      console.log(order);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error assigning chef to order", error });
    }
  },
};

export default orderController;
