import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js"; // Assuming `Notifications` is a part of your models

const createNotification = async (req, res, next) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    return next(createCustomError("Please provide all required fields", 404));
  }

  try {
    const newNotification = new db.Notifications({
      title,
      description,
    });

    await newNotification.save();

    const response = sendSuccessApiResponse(
      "Notification created successfully",
      newNotification
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const updateNotification = async (req, res, next) => {
  const { notificationId } = req.params;
  const { title, description } = req.body;

  if (!notificationId) {
    return next(createCustomError("Notification Id is required to update", 404));
  }

  try {
    const updatedNotification = await db.Notifications.findByIdAndUpdate(
      notificationId,
      { title, description },
      { new: true }
    );

    if (!updatedNotification) {
      return next(createCustomError("Notification Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Notification updated successfully",
      updatedNotification
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await db.Notifications.find({});
    const response = sendSuccessApiResponse(
      "Notifications retrieved successfully",
      notifications
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getNotificationById = async (req, res, next) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return next(createCustomError("Notification Id is required to retrieve", 404));
  }

  try {
    const notification = await db.Notifications.findById(notificationId);

    if (!notification) {
      return next(createCustomError("Notification Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Notification retrieved successfully",
      notification
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return next(createCustomError("Notification Id is required to delete", 404));
  }

  try {
    const deletedNotification = await db.Notifications.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return next(createCustomError("Notification Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Notification deleted successfully",
      deletedNotification
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const notificationController = {
  createNotification,
  updateNotification,
  getAllNotifications,
  getNotificationById,
  deleteNotification,
};

export default notificationController;
