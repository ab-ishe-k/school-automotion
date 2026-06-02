import User from '../models/User.js';
import Email from '../models/Email.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_school_erp_token_guard_2026', {
    expiresIn: process.env.JWT_EXPIRE || '2h'
  });
};

// Helper for Audit Logs
export const logActivity = async (user, role, action, details = '') => {
  try {
    await AuditLog.create({
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    });
  } catch (err) {
    console.error('Audit logging error:', err);
  }
};

// Helper for Notifications
export const notifyUser = async (message, type = 'info') => {
  try {
    await Notification.create({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    });
  } catch (err) {
    console.error('Notification pushing error:', err);
  }
};

// Helper for sending Simulated Emails
export const sendSimulatedEmail = async (to, subject, body, sender = 'IT Security Desk <security@highschool.edu>') => {
  try {
    await Email.create({
      to,
      subject,
      body,
      sender,
      date: new Date().toISOString(),
      isRead: false
    });
  } catch (err) {
    console.error('Email simulated send error:', err);
  }
};

// @desc    Auth User (Verify username/tempId and password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Check for user
    let user = await User.findOne({
      $or: [
        { tempId: username },
        { permanentUsername: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please double check.' });
    }

    // Verify password based on setup status
    let isMatch = false;
    if (!user.isSetupCompleted) {
      isMatch = user.tempPassword === password;
    } else {
      isMatch = await user.matchPassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please double check.' });
    }

    // Create Token
    const token = signToken(user._id);

    // Activity Log
    await logActivity(user.name, user.role, 'Logged in to Portal', `Session authorized via REST API JWT.`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isSetupCompleted: user.isSetupCompleted,
        linkedStudentName: user.linkedStudentName,
        description: user.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete Onboarding setup
// @route   POST /api/auth/onboarding
// @access  Private
export const completeOnboarding = async (req, res, next) => {
  try {
    const { permanentUsername, newPassword } = req.body;
    const userId = req.user.id;

    if (!permanentUsername || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    // Check if username taken
    const usernameTaken = await User.findOne({
      $or: [
        { permanentUsername: { $regex: new RegExp(`^${permanentUsername}$`, 'i') } },
        { tempId: { $regex: new RegExp(`^${permanentUsername}$`, 'i') } }
      ]
    });

    if (usernameTaken && usernameTaken.id !== userId) {
      return res.status(400).json({ success: false, message: `Username "${permanentUsername}" is already taken.` });
    }

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.permanentUsername = permanentUsername;
    user.passwordHash = newPassword; // Pre-save hook will hash this!
    user.isSetupCompleted = true;
    user.tempId = '';
    user.tempPassword = '';

    await user.save();

    await logActivity(user.name, user.role, 'Completed Onboarding Setup', `Activated permanent username: ${permanentUsername}`);
    await notifyUser(`Account onboarding completed successfully for ${user.name}!`, 'success');

    // Return new details and fresh token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isSetupCompleted: user.isSetupCompleted,
        linkedStudentName: user.linkedStudentName,
        description: user.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isSetupCompleted: user.isSetupCompleted,
        linkedStudentName: user.linkedStudentName,
        description: user.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password - simulate sending email
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email address not registered.' });
    }

    const recoveryToken = `rst_tok_${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Save recovery token to user temp field or cache
    user.tempPassword = recoveryToken; // temporarily store token in tempPassword for simple verification
    await user.save();

    const bodyText = `Dear ${user.name},\n\nWe received a request to securely reset the password for your ERP account.\n\nPlease click the link below to overwrite your credentials and create a new secure password:\n\nhttp://localhost:5173/reset-password?token=${recoveryToken}&email=${email}\n\nThis token is valid for 1 hour. If you did not request this, please notify the IT Administration office immediately.\n\nWarm regards,\nIT Security Desk\nHigh School`;

    await sendSimulatedEmail(email, '🔒 Security Desk: Password Reset Link', bodyText);
    await logActivity(user.name, user.role, 'Requested Password Reset Link', `Simulated recovery link emailed.`);

    res.status(200).json({
      success: true,
      message: 'Password recovery instructions have been successfully dispatched to your inbox!'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user || user.tempPassword !== token || !token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired recovery token.' });
    }

    user.passwordHash = newPassword; // Pre-save hook will hash this!
    user.isSetupCompleted = true;
    user.tempPassword = '';
    user.permanentUsername = user.permanentUsername || email.split('@')[0];

    await user.save();

    await logActivity(user.name, user.role, 'Reset Password Successfully', `Credentials updated via simulated reset gate.`);
    await notifyUser(`Security password updated for ${user.name}.`, 'warning');

    res.status(200).json({
      success: true,
      message: 'Password reset completed. You may now log in.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get temporary users (for onboarding desk dropdown)
// @route   GET /api/auth/temp-users
// @access  Public
export const getTempUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isSetupCompleted: false });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
