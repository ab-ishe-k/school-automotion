import express from 'express';
import { 
  recordAttendance, 
  createNotice, 
  createExam, 
  enterMarks, 
  uploadHomework, 
  submitHomework, 
  gradeHomework
} from '../controllers/academicController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/attendance', protect, recordAttendance);
router.post('/notice', protect, createNotice);
router.post('/exam', protect, createExam);
router.post('/marks', protect, enterMarks);
router.post('/homework', protect, uploadHomework);
router.post('/homework/submit', protect, submitHomework);
router.post('/homework/grade', protect, gradeHomework);

export default router;
