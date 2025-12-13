/**
 * Script to seed sample fruit products into the database
 * Run: node scripts/seedProducts.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getImagePath } = require('./getImagePath');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit_mstore';

// Using local images from public/images folder
const sampleProducts = [
  {
    name: 'Apple',
    price: 50,
    stock: 100,
    image: '/images/Appl2.jfif',
    description: 'Crisp and juicy red apples, rich in fiber and antioxidants. Perfect for snacking or cooking. Freshly picked and carefully selected for quality.',
    available: true
  },
  {
    name: 'Banana',
    price: 30,
    stock: 150,
    image: '/images/Banana.jfif',
    description: 'Sweet and creamy bananas, packed with potassium and essential vitamins. Naturally ripened to perfection. Great for breakfast or smoothies.',
    available: true
  },
  {
    name: 'Orange',
    price: 40,
    stock: 120,
    image: '/images/Orange.jfif',
    description: 'Fresh, tangy oranges bursting with Vitamin C. Juicy and refreshing, perfect for a healthy boost. Hand-picked for maximum freshness.',
    available: true
  },
  {
    name: 'Mango',
    price: 80,
    stock: 80,
    image: '/images/mangos.jfif',
    description: 'Sweet and aromatic mangoes, the king of fruits. Rich in vitamins A and C. Premium quality, naturally ripened for the best taste.',
    available: true
  },
  {
    name: 'Grapes',
    price: 60,
    stock: 90,
    image: '/images/Grapes.jfif',
    description: 'Sweet and succulent grapes, perfect for snacking. Rich in antioxidants and natural sugars. Freshly harvested and carefully packed.',
    available: true
  },
  {
    name: 'Watermelon',
    price: 100,
    stock: 50,
    image: '/images/water melon.jfif',
    description: 'Refreshing and hydrating watermelon, perfect for summer. Sweet and juicy, packed with water and essential nutrients. Cut fresh daily.',
    available: true
  },
  {
    name: 'Pineapple',
    price: 70,
    stock: 60,
    image: '/images/images.jfif', // Using generic image placeholder since pineapple.jfif is missing
    description: 'Tropical and tangy pineapple, rich in Vitamin C and enzymes. Sweet and juicy, perfect for tropical recipes or fresh snacking.',
    available: true
  },
  {
    name: 'Strawberry',
    price: 90,
    stock: 70,
    image: '/images/strawbery.jfif',
    description: 'Sweet and juicy strawberries, rich in antioxidants and Vitamin C. Freshly picked, bright red and perfectly ripe. Perfect for desserts.',
    available: true
  },
  {
    name: 'Kiwi',
    price: 55,
    stock: 85,
    image: '/images/kiwi.jfif',
    description: 'Tart and sweet kiwi fruit, packed with Vitamin C and fiber. Unique flavor and vibrant green color. Fresh and ready to eat.',
    available: true
  },
  {
    name: 'Papaya',
    price: 45,
    stock: 75,
    image: '/images/papaya.jfif',
    description: 'Sweet and tropical papaya, rich in enzymes and vitamins. Soft, orange flesh with a unique flavor. Great for digestion and health.',
    available: true
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - remove this if you want to keep existing products)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Check which products already exist
    const existingProducts = await Product.find({});
    const existingNames = existingProducts.map(p => p.name.toLowerCase());

    let addedCount = 0;
    let skippedCount = 0;

    for (const productData of sampleProducts) {
      // Check if product with same name exists
      if (existingNames.includes(productData.name.toLowerCase())) {
        console.log(`⏭️  Skipping ${productData.name} - already exists`);
        skippedCount++;
        continue;
      }

      const product = new Product(productData);
      await product.save();
      console.log(`✅ Added: ${productData.name} - ₹${productData.price} (Stock: ${productData.stock})`);
      addedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${addedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products (already exist)`);
    console.log(`   📦 Total products in database: ${await Product.countDocuments()}`);

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB connection failed. Please ensure:');
      console.error('   1. MongoDB is installed and running');
      console.error('   2. MongoDB service is started');
      console.error('   3. Connection string is correct in .env file');
      console.error('\n   For Windows: Start MongoDB service or run mongod.exe');
    }
    process.exit(1);
  }
}

seedProducts();

