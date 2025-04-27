import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/usersModel.js';

dotenv.config();

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('Admin user found:', {
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      });
    } else {
      console.log('No admin user found in the database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdminUser(); 