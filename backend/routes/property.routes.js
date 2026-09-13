import express from 'express';
import {
  getAllProperties,
  addProperty,
  getMyProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getPropertyDetails,
  getPropertyCount,
  getSellerDashboard,
} from '../controllers/property.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import upload  from '../middlewares/upload.middleware.js';

const propertyRouter = express.Router();

// ==========================
// PUBLIC ROUTES (Static First)
// ==========================

propertyRouter.get('/', getAllProperties);
propertyRouter.get('/count/by-type', getPropertyCount);

// ==========================
// PRIVATE SELLER ROUTES (Authentication & Role Required)
// ==========================

propertyRouter.get('/seller/dashboard', protect, authorizeRoles('seller'), getSellerDashboard);
propertyRouter.get('/my-properties', protect, authorizeRoles('seller'), getMyProperty);
propertyRouter.post('/', protect, authorizeRoles('seller'), upload.array('images', 10), addProperty);
propertyRouter.put('/:id', protect, authorizeRoles('seller'), upload.array('images', 10), updateProperty);
propertyRouter.delete('/:id', protect, authorizeRoles('seller'), deleteProperty);
propertyRouter.patch('/:id/status', protect, authorizeRoles('seller'), updatePropertyStatus);

// ==========================
// DYNAMIC ID ROUTE (Must ALWAYS be at the bottom)
// ==========================

propertyRouter.get('/:id', getPropertyDetails);

export default propertyRouter;