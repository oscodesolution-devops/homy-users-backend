import authRoute from "./auth.routes.js"
import userRoute from "./user.routes.js"
import planRoute from "./plan.routes.js"
import notificationRoute from "./notification.routes.js"
import discountCodeRoute from "./discountCode.routes.js"
import mealPlanRoute from "./mealPlan.routes.js"
import postRoute from "./post.routes.js"
import orderRoute from "./order.routes.js"
import adminRoute from "./admin.routes.js"
import couponRoute from "./coupon.routes.js"
import queryRoute from "./query.routes.js"
import express from "express";


const router = express.Router();
router.use("/auth",authRoute);
router.use("/profile",userRoute);
router.use("/plans",planRoute);
router.use("/notifications",notificationRoute);
router.use("/discount-code",discountCodeRoute);
router.use("/meal-plan",mealPlanRoute);
router.use("/post",postRoute);
router.use("/order",orderRoute);
router.use("/admin",adminRoute);
router.use("/coupon",couponRoute);
router.use("/query", queryRoute);

router.get("/",async (req, res) => {
    return res.status(200).send({
     uptime: process.uptime(),
     message: "VS's API health check :: GOOD",
     timestamp: Date.now(),
   });
 });

export default router;
