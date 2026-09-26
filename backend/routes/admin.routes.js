import express from 'express';
import {
  getAllUsers,
  toggleBlockUser,
  getAllInquiries,
  deleteUser,
  getDashboardAnalytics,
  getPendingSellers,
  approveSeller,
  getAllProperties as getAllAdminProperties,
  verifyProperty,
} from '../controllers/admin.controller.js';

// Import your authentication middlewares
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'; 

const adminRouter = express.Router();


adminRouter.use(protect, authorizeRoles('admin'));


// ==========================================
// 2. DASHBOARD ANALYTICS
// ==========================================
// Matches: GET /api/admin/analytics
adminRouter.get('/analytics', getDashboardAnalytics);


// ==========================================
// 3. USER MANAGEMENT & APPROVALS
// ==========================================

adminRouter.get('/users/pending-sellers', getPendingSellers);

adminRouter.get('/users', getAllUsers);

adminRouter.get('/inquiries', getAllInquiries);
adminRouter.get('/properties', getAllAdminProperties);
adminRouter.patch('/properties/:id/verify', verifyProperty);

adminRouter.put('/users/:id/block', toggleBlockUser);

adminRouter.put('/users/:id/approve', approveSeller);

adminRouter.delete('/users/:id', deleteUser);

export default adminRouter;