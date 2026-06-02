import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  class: {
    type: String,
    required: [true, 'Please assign a class']
  },
  rollNumber: {
    type: String,
    required: [true, 'Please assign a roll number']
  },
  parentName: {
    type: String,
    required: [true, "Please add a parent's name"]
  },
  parentEmail: {
    type: String,
    required: [true, "Please add a parent's email"]
  },
  parentContact: {
    type: String,
    required: [true, "Please add a parent's contact number"]
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  monthlyTuitionFee: {
    type: Number,
    required: true,
    default: 0
  },
  busFee: {
    type: Number,
    required: true,
    default: 0
  },
  monthlyExtraCurricularFee: {
    type: Number,
    required: true,
    default: 0
  },
  totalMonthlyFee: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  pendingMonths: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Outstanding'],
    default: 'Pending'
  },
  remindersActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', StudentSchema);
