import Application from "./application.model.js";
import Notifications from "./notifications.model.js";
import Plan from "./plans.model.js";
import User from "./user.model.js";
import UserDetails from "./userDetails.model.js";
import DiscountCode from "./discountCode.model.js";
import MealPlan from "./mealPlan.model.js";
import Post from "./posts.model.js";
import Order from "./orders.model.js";
import Chef from "./chef.model.js";
import Task from "./task.model.js";
import Role from "./role.model.js";
import Admin from "./admin.model.js";
import Coupon from "./coupon.model.js";
import Gallery from "./Gallery.model.js";
import Query from "./query.model.js";



const db = {
    User,
    UserDetails,
    Plan,
    Notifications,
    Application,
    DiscountCode,
    MealPlan,
    Post,
    Order,
    Chef,
    Task,
    Role,
    Admin,
    Coupon,
    Gallery,
    Query,
}

export default db;