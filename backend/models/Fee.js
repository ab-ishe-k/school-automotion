import mongoose from 'mongoose';

const FeeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  status: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PENDING'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Fee', FeeSchema);
