/**
 * Script to force update all products with local images
 * Run: node scripts/forceUpdateImages.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
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
  'pineapple': '/images/images.jfif', // Using generic image placeholder since pineapple.jfif is missing
  'strawberry': '/images/strawbery.jfif',
  'kiwi': '/images/kiwi.jfif',
  'papaya': '/images/papaya.jfif'
};

async function forceUpdateImages() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const productNameLower = product.name.toLowerCase().trim();
      
      // Find matching image
      if (productImages[productNameLower]) {
        product.image = productImages[productNameLower];
        await product.save();
        console.log(`✅ Updated: ${product.name} → ${productImages[productNameLower]}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No image mapping found for: ${product.name}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products with local images`);
    console.log(`   📦 Total products: ${products.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Force update completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceUpdateImages();

