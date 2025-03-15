import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import CheckInOutModel from "../models/CheckInOut.model.js";
import db from "../models/index.js";
import {
  generateRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/razorpay.js";
import CheckInOut from "../models/CheckInOut.model.js";

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
        { _id: order.user },
        {
          activePlan: order.planID
        },
        { new: true }
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

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const chef = await db.Chef.findByIdAndUpdate(
        chefId,
        { $push: { orders: orderId } }, // Add orderId to chef's orders array
        { new: true }
      );

      if (!chef) {
        return res.status(404).json({ message: "Chef not found" });
      }

      res.status(200).json({ message: "Chef assigned successfully", order, chef });
    } catch (error) {
      console.error("Error assigning chef:", error);
      res.status(500).json({ message: "Error assigning chef to order", error });
    }
  },

  updateCheckinStatus: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Invalid order ID" });

      const order = await db.Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.checkedInAt = new Date();
      await order.save();

      res.status(200).json({ message: "Chef checked in successfully", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateCheckoutStatus: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Invalid order ID" });

      const order = await db.Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });


      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded!" });
      }

      order.checkedOutAt = new Date();
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          return await uploadToCloudinary(file.path, "checkout_images");
        })
      );

      order.checkoutImage.push(...uploadedImages); // Append Cloudinary URLs to order

      await order.save();
      res.status(200).json({ message: "Chef checked out successfully", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },



  //i am trying to put logic in this.
  updateCheckinStatusajay: async (req, res) => {
    try {
      const { orderId } = req.params;
      const chefId = req.user._id;
      const now = new Date();

      //order find karenge ham
      const order = await db.Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      //ham check karenge ki es order par ye chef asign hai ya nhi
      if (order.chef.toString() !== chefId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      //ham check karenge ki aaj chhuti to nhi hai chef ki
      const today = new Date().toLocaleString('en-US', { weekday: 'long' });
      if (order.chefDayOff === today) {
        return res.status(400).json({ message: 'Today is your day off!' });
      }

      const morningTime = new Date(order.planStartDate);
      morningTime.setHours(11, 0, 0, 0); // Morning Meal Time Fixed 11:00 AM
      const morningEndTime = new Date(morningTime.getTime() + 2 * 60 * 60 * 1000); // 2 ghante tak valid

      const eveningTime = new Date(order.planStartDate);
      eveningTime.setHours(20, 0, 0, 0); // Evening Meal Time Fixed 08:00 PM
      const eveningEndTime = new Date(eveningTime.getTime() + 2 * 60 * 60 * 1000);

      // Check-in validation
      if (!((now >= morningTime && now <= morningEndTime) || (now >= eveningTime && now <= eveningEndTime))) {
        return res.status(400).json({ message: 'Check-in time is not valid! Chef can check-in only within 2 hours of meal time.' });
      }

      order.checkedInAt = now;
      await order.save();

      res.status(200).json({ message: 'Check-in successful!', order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },


  updateCheckoutStatusajay: async (req, res) => {
    try {
      const { orderId } = req.params;
      const chefId = req.user._id;
      const now = new Date();

      //order find karenge ham
      const order = await db.Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      //ham check karenge ki es order par ye chef asign hai ya nhi
      if (order.chef.toString() !== chefId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded!" });
      }

      const morningTime = new Date(order.planStartDate);
      morningTime.setHours(11, 0, 0, 0); // Morning Meal Time Fixed 11:00 AM
      const morningEndTime = new Date(morningTime.getTime() + 2 * 60 * 60 * 1000); // 2 ghante tak valid

      const eveningTime = new Date(order.planStartDate);
      eveningTime.setHours(20, 0, 0, 0); // Evening Meal Time Fixed 08:00 PM
      const eveningEndTime = new Date(eveningTime.getTime() + 2 * 60 * 60 * 1000);


      // Check-in validation
      if (!((now >= morningTime && now <= morningEndTime) || (now >= eveningTime && now <= eveningEndTime))) {
        return res.status(400).json({ message: 'Check-in time is not valid! Chef can check-in only within 2 hours of meal time.' });
      }


     // Image Upload to Cloudinary
     let uploadedImages = [];
     if (req.files && req.files.length > 0) {
         uploadedImages = await Promise.all(
             req.files.map(async (file) => {
                 return await uploadToCloudinary(file.path, "checkout_images");
             })
         );
     }

     // Checkout details update karein
     order.checkedOutAt = now;
     order.checkinStatus = 'checked out'; // ✅ checkinStatus update kiya

     if (uploadedImages.length > 0) {
         order.checkoutImage.push(...uploadedImages); // ✅ Checkout images bhi store kar rahe hain
     }

     await order.save();
     res.status(200).json({ message: 'Checkout successful!', order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  checkIn: async (req, res) => {
    try {
      const { orderId, mealTime } = req.params;
      const { timestamp } = req.body;
      
      // Create the check-in time in UTC
      const checkInTime = timestamp ? new Date(timestamp) : new Date();
      
      // Create the date for the record (start of the day in UTC)
      const recordDate = new Date(checkInTime);
      recordDate.setUTCHours(0, 0, 0, 0);

      // Find existing record
      let checkInRecord = await CheckInOut.findOne({
        orderId,
        date: recordDate,
        mealTime
      });

      if (checkInRecord) {
        // Update existing record
        checkInRecord.checkedIn = true;
        checkInRecord.checkinTime = checkInTime;
        checkInRecord.checkedOut = false;
        checkInRecord.checkoutTime = null;
        checkInRecord.checkoutImage = null;
        
        await checkInRecord.save();
      } else {
        // Create new record
        checkInRecord = await CheckInOut.create({
          orderId,
          date: recordDate,
          mealTime,
          checkedIn: true,
          checkinTime: checkInTime
        });
      }

      // Format the response with UTC times
      const formattedResponse = {
        ...checkInRecord.toObject(),
        checkinTime: formatDateTime(checkInRecord.checkinTime),
        checkoutTime: checkInRecord.checkoutTime ? formatDateTime(checkInRecord.checkoutTime) : null
      };

      res.status(200).json({
        success: true,
        message: 'Check-in successful',
        data: formattedResponse
      });

    } catch (error) {
      console.error("Error in checkIn:", error);
      res.status(500).json({ message: error.message });
    }
  },

  checkOut: async (req, res) => {
    try {
      const { orderId, mealTime } = req.params;
      const { imageUrl, timestamp } = req.body;
      
      // Create the check-out time
      const checkOutTime = timestamp ? new Date(timestamp) : new Date();
      
      // Create the date for finding the record (start of the day in UTC)
      const recordDate = new Date(checkOutTime);
      recordDate.setUTCHours(0, 0, 0, 0);

      const checkInRecord = await CheckInOut.findOne({
        orderId,
        date: recordDate,
        mealTime
      });

      if (!checkInRecord || !checkInRecord.checkedIn) {
        return res.status(400).json({ message: 'Must check-in before checking out' });
      }

      checkInRecord.checkedOut = true;
      checkInRecord.checkoutTime = checkOutTime; // Store the exact check-out time
      checkInRecord.checkoutImage = imageUrl;
      await checkInRecord.save();

      res.status(200).json({
        success: true,
        message: 'Check-out successful',
        data: checkInRecord
      });

    } catch (error) {
      console.error("Error in checkOut:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getCheckinHistory: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const checkInHistory = await CheckInOut.find({
        orderId,
        date: {
          $gte: start,
          $lte: end
        }
      }).sort({ date: -1 });

      res.status(200).json({
        success: true,
        data: {
          totalDays: checkInHistory.length,
          history: checkInHistory
        }
      });

    } catch (error) {
      console.error("Error in getCheckinHistory:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getDetailedCheckinHistory: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { startDate, endDate } = req.query;

      // Find order and populate chef details
      const order = await db.Order.findById(orderId)
        .populate({
          path: 'chef',
          select: 'name phoneNumber profileImage'
        })
        .populate({
          path: 'user',
          select: 'name phoneNumber'
        });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }

      // Calculate date range
      const start = startDate ? new Date(startDate) : new Date(order.planStartDate);
      const end = endDate ? new Date(endDate) : new Date();
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);

      const checkInRecords = await CheckInOut.find({
        orderId: order._id,
        date: {
          $gte: start,
          $lte: end
        }
      }).sort({ date: 1, mealTime: 1 });

      // Group records by date without dayOfWeek and isChefDayOff
      const groupedRecords = {};
      checkInRecords.forEach(record => {
        const dateKey = record.date.toISOString().split('T')[0];
        if (!groupedRecords[dateKey]) {
          groupedRecords[dateKey] = {
            date: dateKey,
            meals: {}
          };
        }

        groupedRecords[dateKey].meals[record.mealTime] = {
          checkedIn: record.checkedIn,
          checkedOut: record.checkedOut,
          checkinTime: record.checkinTime ? formatDateTime(record.checkinTime) : null,
          checkoutTime: record.checkoutTime ? formatDateTime(record.checkoutTime) : null,
          checkoutImage: record.checkoutImage,
          status: getStatus(record)
        };
      });

      const response = {
        success: true,
        orderDetails: {
          orderId: order._id,
          planStartDate: order.planStartDate,
          planEndDate: order.planEndDate,
          chefDetails: {
            name: order.chef?.name || 'Not Assigned',
            phoneNumber: order.chef?.phoneNumber,
            profileImage: order.chef?.profileImage
          },
          userDetails: {
            name: order.user?.name,
            phoneNumber: order.user?.phoneNumber
          },
          mealTimings: {
            morning: order.morningMealTime,
            evening: order.eveningMealTime
          }
        },
        dateRange: {
          from: start.toISOString().split('T')[0],
          to: end.toISOString().split('T')[0]
        },
        totalDays: Object.keys(groupedRecords).length,
        history: Object.values(groupedRecords)
      };

      res.status(200).json(response);

    } catch (error) {
      console.error("Error in getDetailedCheckinHistory:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal Server Error" 
      });
    }
  },

};

// Helper function to determine status
const getStatus = (record) => {
  if (!record.checkedIn) return 'PENDING';
  if (record.checkedIn && !record.checkedOut) return 'CHECKED_IN';
  if (record.checkedIn && record.checkedOut) return 'COMPLETED';
  return 'UNKNOWN';
};

// Helper function to format dates consistently in UTC
const formatDateTime = (date) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export default orderController;
