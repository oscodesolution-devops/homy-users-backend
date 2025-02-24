import { createCustomError } from "../errors/customAPIError.js";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";

const createQuery = async (req, res, next) => {
  const { name, email, phoneNumber, message } = req.body;
  if (!(name && email && phoneNumber && message)) {
    return next(createCustomError("Please enter all the required fields", 400));
  }
  try {
    const newQuery = new db.Query({
      name,
      email,
      phoneNumber,
      message,
    });

    await newQuery.save();
    const response = sendSuccessApiResponse(
      "Query submitted successfully",
      newQuery
    );
    return res.status(201).send(response);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return next(createCustomError(error.message, 400));
    }
    res.status(500).send(error);
  }
};

const getAllQueries = async (req, res, next) => {
  try {
    const queries = await db.Query.find({}).sort({ createdAt: -1 });
    const response = sendSuccessApiResponse(
      "Queries retrieved successfully",
      queries
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getQueryById = async (req, res, next) => {
  const { queryId } = req.params;
  if (!queryId) {
    return next(createCustomError("Query Id is required", 400));
  }
  try {
    const query = await db.Query.findById(queryId);

    if (!query) {
      return next(createCustomError("Query Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Query retrieved successfully",
      query
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const updateQueryStatus = async (req, res, next) => {
  const { queryId } = req.params;
  const { status,comment} = req.body;
  if (!queryId) {
    return next(createCustomError("Query Id is required to update", 400));
  }
  if (!status) {
    return next(createCustomError("Status is required to update", 400));
  }
  try {
    const updatedQuery = await db.Query.findByIdAndUpdate(
      queryId,
      { status,
        comment,
      },
      { new: true }
    );

    if (!updatedQuery) {
      return next(createCustomError("Query Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Query status updated successfully",
      updatedQuery
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const deleteQuery = async (req, res, next) => {
  const { queryId } = req.params;
  if (!queryId) {
    return next(createCustomError("Query Id is required to delete", 400));
  }
  try {
    const deletedQuery = await db.Query.findByIdAndDelete(queryId);

    if (!deletedQuery) {
      return next(createCustomError("Query Not Found", 404));
    }

    const response = sendSuccessApiResponse(
      "Query deleted successfully",
      deletedQuery
    );
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const queryController = {
  createQuery,
  getAllQueries,
  getQueryById,
  updateQueryStatus,
  deleteQuery,
};

export default queryController;