import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['Principal', 'Vice Principal', 'Teacher', 'Student', 'Parent', 'Admin Staff', 'Reception / Office Staff'],
    required: [true, 'Please specify a role']
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  tempId: {
    type: String,
    default: ''
  },
  tempPassword: {
    type: String,
    default: ''
  },
  permanentUsername: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null/empty fields
  },
  passwordHash: {
    type: String,
    default: ''
  },
  isSetupCompleted: {
    type: Boolean,
    default: false
  },
  linkedStudentName: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving if it has been modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Match user typed password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export default mongoose.model('User', UserSchema);
