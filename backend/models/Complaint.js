import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  submittedBy: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  complaintType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedOfficer: {
    type: String,
    required: true
  },
  date: {
    type: String, // ISO String
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  actionTaken: {
    type: String,
    default: ''
  },
  resolvedDate: {
    type: String,
    default: ''
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  internalNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', ComplaintSchema);
