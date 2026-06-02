import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  raisedBy: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedTo: {
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
  resolution: {
    type: String,
    default: ''
  },
  closedDate: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Query', QuerySchema);
