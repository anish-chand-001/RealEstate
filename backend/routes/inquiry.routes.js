import express from 'express';
import {
  sendInquiry,
  getSellerInquiries,
  markInquiryAsRead,
} from '../controllers/inquiry.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/', protect,authorizeRoles("buyer"), sendInquiry);
inquiryRouter.get('/seller/inquiries', protect, authorizeRoles('seller'), getSellerInquiries);
inquiryRouter.patch('/:id/read', protect, authorizeRoles('seller'), markInquiryAsRead);

export default inquiryRouter;