import { DEV_ENVIRONMENT, PROD_ENVIRONMENT } from "../constants/constants.js";
import { customAPIError } from "../errors/customAPIError.js";
import { logger } from "../server.js";

const isProd = PROD_ENVIRONMENT.includes(process.env.NODE_ENV);
const isDev = DEV_ENVIRONMENT.includes(process.env.NODE_ENV);

const sendErrorForDev = (err, res) => {
  res.status(err.status.code || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.status.code).json({
      status: err.status,
      error: { message: err.message },
    });
  } else {
    res.status(500).json({
      status: { code: 500, message: "fail" },
      error: { message: "Something went very wrong" },
    });
  }
};

const handleCastError = (err) => {
  const message = `Cannot find ${err.path}: ${err.value}`;
  return new customAPIError(message, 400);
};

const handleDublicateFieldError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field ${value}. Please use another one`;
  return new customAPIError(message, 400);
};

const handleS3Error = () => {
  const message = "Something went very wrong";
  return new customAPIError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => {
    return error.message;
  });
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new customAPIError(message, 400);
};

const errorHandlerMiddleware = (
  err,
  req,
  res,
  next
) => {
  err.status = err.status || { code: 500, success: false };
  err.isOperational = err.isOperational
    ? true
    : err.isOperational === false
    ? false
    : true;

  if (!isDev) {
    let error = Object.assign(Object.create(err), err);
    if (error.name === "CastError") {
      error = handleCastError(err);
    }
    if (error.code == 11000) {
      error = handleDublicateFieldError(err);
    }
    if (error.name === "ValidationError") {
      error = handleValidationError(err);
    }

    if (
      err.code === "SignatureDoesNotMatch" ||
      err.code === "InvalidAccessKeyId" ||
      err.code === "NoSuchBucket"
    ) {
      error = handleS3Error();
    }
    sendErrorForProd(error, res);
  } else {
    sendErrorForDev(err, res);
  }

  const logError = `StatusCode: ${err.status.code} | Message: ${err.message} \n${err.stack}`;
  logger.error(logError);
};

export default errorHandlerMiddleware;
