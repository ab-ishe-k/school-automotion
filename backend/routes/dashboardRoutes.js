import express from 'express';
import { 
  getAllDataBundle, 
  bookAppointment, 
  updateAppointment, 
  registerStudent, 
  registerTeacher, 
  payFee, 
  payTeacherSalary,
  raiseQuery,
  updateQuery,
  submitComplaint,
  updateComplaint,
  applyLeave,
  updateLeave,
  updateSheetRow,
  deleteSheetRow,
  markNotificationsRead,
  sendEmailRoute
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/bundle', protect, getAllDataBundle);
router.post('/email/send', protect, sendEmailRoute);

// Appointments
router.post('/appointment', protect, bookAppointment);
router.patch('/appointment/:id', protect, updateAppointment);

// Student & Teacher Enrollments (Authorized for Admin Staff, Vice Principal, Principal)
router.post('/student', protect, authorize('Admin Staff', 'Vice Principal', 'Principal'), registerStudent);
router.post('/teacher', protect, authorize('Admin Staff', 'Vice Principal', 'Principal'), registerTeacher);

// Transactions
router.post('/pay/fee', protect, payFee);
router.post('/pay/salary', protect, payTeacherSalary);

// Queries & Complaints
router.post('/query', protect, raiseQuery);
router.patch('/query/:id', protect, updateQuery);
router.post('/complaint', protect, submitComplaint);
router.patch('/complaint/:id', protect, updateComplaint);

// Leaves
router.post('/leave', protect, applyLeave);
router.patch('/leave/:id', protect, updateLeave);

// General Sheet CRUD
router.put('/sheet/:sheetName/:id', protect, updateSheetRow);
router.delete('/sheet/:sheetName/:id', protect, deleteSheetRow);

// Notifications
router.post('/notifications/clear', protect, markNotificationsRead);

export default router;
