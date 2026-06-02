import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/school_automation',
      {
        serverSelectionTimeoutMS: 5000 // fail fast in 5 seconds
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('Backend will remain active in offline simulation mode. Please start MongoDB if you want to use database persistent storage.');
  }
};

export default connectDB;
