/**
 * Script to update existing products with images
 * Run: node scripts/updateProductImages.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getImagePath } = require('./getImagePath');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

// Map product names to local image paths
const productImages = {
  'apple': '/images/Appl2.jfif',
  'banana': '/images/Banana.jfif',
  'orange': '/images/Orange.jfif',
  'mango': '/images/mangos.jfif',
  'grapes': '/images/Grapes.jfif',
  'watermelon': '/images/water melon.jfif',
  'pineapple': '/images/pineapple.jfif', // Fallback if not available
  'strawberry': '/images/strawbery.jfif',
  'kiwi': '/images/kiwi.jfif',
  'papaya': '/images/papaya.jfif'
};

async function updateProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const productNameLower = product.name.toLowerCase();
      
      // Check if product already has an image
      if (product.image && product.image.trim() !== '') {
        console.log(`⏭️  Skipping ${product.name} - already has an image`);
        continue;
      }

      // Find matching image using helper function or direct map
      const imagePath = productImages[productNameLower] || getImagePath(product.name);
      
      if (imagePath && imagePath !== '/images/default.jfif') {
        product.image = imagePath;
        await product.save();
        console.log(`✅ Updated: ${product.name} with image ${imagePath}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No image found for: ${product.name}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products with images`);
    console.log(`   📦 Total products: ${products.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Update completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProductImages();

