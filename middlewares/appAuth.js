import jwt from 'jsonwebtoken';
import { createCustomError } from '../errors/customAPIError.js';
import db from '../models/index.js';

export const authenticateChef = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const chef = await db.Chef.findById(decoded.id);
    
    if (!chef) {
      return res.status(401).json({
        success: false,
        message: "Chef not found"
      });
    }

    req.chef = chef;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token"
    });
  }
};