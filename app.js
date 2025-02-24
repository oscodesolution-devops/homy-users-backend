import * as dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import express from "express";
import httpContext from "express-http-context";
import notFound from "./errors/notFound.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.js";
import {
    generateRequestId,
    logRequest,
    logResponse,
  } from "./middlewares/commonMiddleware.js";
import { connectDB } from "./config/database.js";
import apiRoutes from "./routes/index.js";

const corsOptions = {
    
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // allowedHeaders: ["Content-Type", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

dotenv.config({ path: `.env` });

const app = express();
connectDB();


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors);

// Set HTTP context
app.use(httpContext.middleware);
app.use(generateRequestId);

// Log all the requests and response.
app.use(logRequest);
app.use(logResponse);
app.use(apiRoutes)

app.use(notFound);
app.use(errorHandlerMiddleware);




export default app;