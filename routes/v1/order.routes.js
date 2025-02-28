import express from 'express';
const router = express.Router();

// Import the necessary controllers
import { isLoggedIn } from '../../middlewares/authorization.js'
import controllers from '../../controllers/index.js';

// Route to generate a new order
router.post('/generate-order', isLoggedIn, controllers.orderController.generateOrder);

// Route to confirm an order
router.post('/order-confirm/:orderId', isLoggedIn, controllers.orderController.confirmOrder);

//update checkin status
router.post('/order_checkIn/:orderId', isLoggedIn, controllers.orderController.updateCheckinStatus);

//update checkout status
router.post('/order_checkOut/:orderId', isLoggedIn, controllers.orderController.updateCheckoutStatus);


export default router;