import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js"

const getApplication = async(req,res,next)=>{
    try{
        const application = await db.Application.find({});

        const response = sendSuccessApiResponse("Application fetched",{application:application[0],user:req.user},200);

        return res.status(200).send(response);
    }catch(error){
        console.log(error);
    }
}

const postApplication = async(req,res,next)=>{
    const {link} = req.body;
    try{
        const application = new db.Application({
            banner:link
        })
        await application.save();
        return res.status(200).send(application);
    }catch(error){
        console.log(error)
    }
}

export const getDashboardData = async (req, res, next) => {
    try {
      const totalRevenue = await db.Order.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
      ]);
      const totalOrders = await db.Order.countDocuments({ status: 'confirmed' });
      const averageOrderValue = totalRevenue[0]?.totalAmount / totalOrders || 0;
  
      const totalChefs = await db.Chef.countDocuments();
      const totalUsers = await db.User.countDocuments();
  
      const response = sendSuccessApiResponse("Dashboard data fetched", {
        totalRevenue: totalRevenue[0]?.totalAmount || 0,
        totalOrders,
        averageOrderValue,
        totalChefs,
        totalUsers
      });
  
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
  
  // Sales controller
  export const getSalesData = async (req, res, next) => {
    const { period } = req.query;
    try {
      let salesData;
      switch (period) {
        case 'monthly':
          salesData = await db.Order.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, totalAmount: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } }
          ]);
          break;
        case 'weekly':
          salesData = await db.Order.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: { $dateToString: { format: '%Y-%w', date: '$createdAt' } }, totalAmount: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } }
          ]);
          break;
        case 'yearly':
          salesData = await db.Order.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: { $dateToString: { format: '%Y', date: '$createdAt' } }, totalAmount: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } }
          ]);
          break;
        default:
          return next(createCustomError("Invalid period parameter", 400));
      }
      const response = sendSuccessApiResponse("Sales data fetched", salesData);
      res.status(200).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };



const applicationController = {
    getApplication,
    postApplication,
    getDashboardData,
    getSalesData,
}

export default applicationController;