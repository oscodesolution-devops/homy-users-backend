/* eslint-disable @typescript-eslint/ban-types */
class customAPIError extends Error {

    status
    isOperational
    path
    value

    constructor( message, statusCode = 500) {
        super(message);
        this.status = { code: statusCode, success:false};
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const createCustomError = (message,  statusCode= 500) => {
    return new customAPIError(message, statusCode);
};

export { customAPIError, createCustomError };
