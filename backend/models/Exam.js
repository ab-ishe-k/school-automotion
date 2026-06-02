import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exam name']
  },
  class: {
    type: String,
    required: [true, 'Please specify a class']
  },
  subject: {
    type: String,
    required: [true, 'Please specify a subject']
  },
  date: {
    type: String,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  }
}, {
  timestamps: true
});

export default mongoose.model('Exam', ExamSchema);
