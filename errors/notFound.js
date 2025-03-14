import { createCustomError } from "./customAPIError.js";

const notFound = (req, res, next) => {
    // const notFoundError = new customAPIError(`Cannot find ${req.originalUrl} at this server`, 404);
    const notFoundError = createCustomError(`Cannot find ${req.originalUrl} at this server`, 404);
    return next(notFoundError);
};

export default notFound;