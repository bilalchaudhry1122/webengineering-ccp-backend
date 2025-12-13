/**
 * Script to check admin user details
 * Run: node scripts/checkAdmin.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB\n');

    const admin = await User.findOne({ email: 'admin@fruitstore.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...\n');
      
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@fruitstore.com',
        password: 'admin123',
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created!');
      console.log('📧 Email: admin@fruitstore.com');
      console.log('🔑 Password: admin123\n');
    } else {
      console.log('✅ Admin user found:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin._id}`);
      
      // Test password
      const passwordTest = await admin.comparePassword('admin123');
      console.log(`\n🔐 Password test (admin123): ${passwordTest ? '✅ Correct' : '❌ Incorrect'}`);
      
      if (!passwordTest) {
        console.log('\n⚠️  Password mismatch! Resetting password...');
        admin.password = 'admin123';
        await admin.save();
        console.log('✅ Password reset to: admin123');
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();

