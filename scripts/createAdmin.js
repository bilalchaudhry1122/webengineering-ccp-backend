/**
 * Helper script to create an admin user
 * Run: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fruitstore.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@fruitstore.com',
      password: 'admin123', // Change this password after first login
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@fruitstore.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();

