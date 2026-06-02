import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  role: {
    type: String,
    default: 'Teacher'
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  designation: {
    type: String,
    required: [true, 'Please specify designation']
  },
  department: {
    type: String,
    required: [true, 'Please specify department']
  },
  classTeacherOf: {
    type: String,
    default: ''
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  monthlySalary: {
    type: Number,
    required: true
  },
  paidSalary: {
    type: Number,
    default: 0
  },
  remainingSalary: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Teacher', TeacherSchema);
