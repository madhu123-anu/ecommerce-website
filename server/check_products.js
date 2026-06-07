const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');

const check = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to DB...', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const prodCount = await Product.countDocuments();
    const catCount = await Category.countDocuments();
    console.log(`Product count in DB: ${prodCount}`);
    console.log(`Category count in DB: ${catCount}`);

    if (prodCount === 0) {
      console.log('No products found! We may need to seed the database.');
    } else {
      const prods = await Product.find().limit(5);
      console.log('Sample products:', prods.map(p => p.title));
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
};

check();
