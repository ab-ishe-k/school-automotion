import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    unique: true
  },
  section: {
    type: String,
    default: 'A'
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  subjects: [{
    type: String
  }],
  timetable: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    periods: [{
      time: String,
      subject: String,
      teacher: String
    }]
  }]
}, {
  timestamps: true
});

export default mongoose.model('Class', ClassSchema);
