import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  appointmentWith: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  calendarEventId: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Appointment', AppointmentSchema);
