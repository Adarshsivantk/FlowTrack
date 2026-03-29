import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
 
dotenv.config();
 
const seedAdmin = async () => {
  try {
    await connectDB();
 
    const existing = await User.findOne({ email: 'admin@example.com' });
 
    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }
 
    // Don't manually hash — User model pre('save') hook handles it
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: '123456',
      role: 'admin',
    });
 
    console.log('✅ Admin created: admin@example.com / 123456');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
 
seedAdmin();