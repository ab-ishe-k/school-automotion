import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  submissionDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Graded'],
    default: 'Submitted'
  },
  submissionText: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  }
});

const HomeworkSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, 'Please specify a class']
  },
  subject: {
    type: String,
    required: [true, 'Please specify a subject']
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  dueDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  submissions: [SubmissionSchema]
}, {
  timestamps: true
});

export default mongoose.model('Homework', HomeworkSchema);
