import express from 'express';
const router = express.Router();

// Import the necessary controllers
import { isLoggedIn } from '../../middlewares/authorization.js'
import controllers from '../../controllers/index.js';

// Route to generate a new order
router.post('/generate-order', isLoggedIn, controllers.orderController.generateOrder);

// Route to confirm an order
router.post('/order-confirm/:orderId', isLoggedIn, controllers.orderController.confirmOrder);

export default router;