class successApiResponse {
    constructor(message, statusCode = 200) {
        this.success;
        this.status = { code: statusCode, message: message };
        this.data = {};
        this.error = {};
    }
    success ;
    data;
    error;
    status;
}

const sendSuccessApiResponse = (message, data, statusCode = 200) => {
    const newApiResponse = new successApiResponse(message, statusCode);
    newApiResponse.success = true;
    newApiResponse.data = data;
    return newApiResponse;
};

export { sendSuccessApiResponse, successApiResponse };
