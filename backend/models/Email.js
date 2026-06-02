import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  from: {
    type: String,
    default: 'School Automation <no-reply@school.edu>'
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    default: 'School Automation <no-reply@school.edu>'
  },
  date: {
    type: String, // ISO Date String
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Email', EmailSchema);
