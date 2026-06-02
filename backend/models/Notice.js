import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a notice title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add notice content']
  },
  audience: {
    type: String,
    enum: ['All', 'Teachers', 'Students', 'Parents'],
    default: 'All'
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Notice', NoticeSchema);
