/**
 * Script to add descriptions to existing products
 * Run: node scripts/addProductDescriptions.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

const productDescriptions = {
  'apple': 'Crisp and juicy red apples, rich in fiber and antioxidants. Perfect for snacking or cooking. Freshly picked and carefully selected for quality.',
  'banana': 'Sweet and creamy bananas, packed with potassium and essential vitamins. Naturally ripened to perfection. Great for breakfast or smoothies.',
  'orange': 'Fresh, tangy oranges bursting with Vitamin C. Juicy and refreshing, perfect for a healthy boost. Hand-picked for maximum freshness.',
  'mango': 'Sweet and aromatic mangoes, the king of fruits. Rich in vitamins A and C. Premium quality, naturally ripened for the best taste.',
  'grapes': 'Sweet and succulent grapes, perfect for snacking. Rich in antioxidants and natural sugars. Freshly harvested and carefully packed.',
  'watermelon': 'Refreshing and hydrating watermelon, perfect for summer. Sweet and juicy, packed with water and essential nutrients. Cut fresh daily.',
  'pineapple': 'Tropical and tangy pineapple, rich in Vitamin C and enzymes. Sweet and juicy, perfect for tropical recipes or fresh snacking.',
  'strawberry': 'Sweet and juicy strawberries, rich in antioxidants and Vitamin C. Freshly picked, bright red and perfectly ripe. Perfect for desserts.',
  'kiwi': 'Tart and sweet kiwi fruit, packed with Vitamin C and fiber. Unique flavor and vibrant green color. Fresh and ready to eat.',
  'papaya': 'Sweet and tropical papaya, rich in enzymes and vitamins. Soft, orange flesh with a unique flavor. Great for digestion and health.'
};

async function addDescriptions() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const productNameLower = product.name.toLowerCase().trim();
      
      // Skip if already has description
      if (product.description && product.description.trim() !== '') {
        console.log(`⏭️  Skipping ${product.name} - already has description`);
        continue;
      }

      // Find matching description
      if (productDescriptions[productNameLower]) {
        product.description = productDescriptions[productNameLower];
        await product.save();
        console.log(`✅ Updated: ${product.name} with description`);
        updatedCount++;
      } else {
        console.log(`⚠️  No description found for: ${product.name}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products with descriptions`);
    console.log(`   📦 Total products: ${products.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Update completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDescriptions();

