import express from 'express';
import { login, completeOnboarding, getMe, forgotPassword, resetPassword, getTempUsers } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/onboarding', protect, completeOnboarding);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/temp-users', getTempUsers);

export default router;
