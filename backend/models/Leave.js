import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  applicantName: {
    type: String,
    required: true
  },
  applicantRole: {
    type: String,
    required: true
  },
  applicantClass: {
    type: String,
    required: true
  },
  startDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  endDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  leaveType: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Leave', LeaveSchema);
