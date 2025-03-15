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

// Chef check-in endpoint
router.post(
  '/checkin/:orderId/:mealTime', 
  controllers.orderController.checkIn
);

// Chef check-out endpoint (with image)
router.post(
  '/checkout/:orderId/:mealTime',
  controllers.orderController.checkOut
);

// View check-in history
router.get(
  '/checkin-history/:orderId',
  controllers.orderController.getCheckinHistory
);

router.get('/checkin-history-detailed/:orderId', controllers.orderController.getDetailedCheckinHistory);

export default router;