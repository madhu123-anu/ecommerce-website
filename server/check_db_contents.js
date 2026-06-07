const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    console.log(`Product count in DB: ${productCount}`);
    console.log(`Category count in DB: ${categoryCount}`);
    
    if (productCount > 0) {
      const someProducts = await Product.find({}).limit(5).populate('category');
      console.log('Sample products:');
      someProducts.forEach(p => {
        console.log(`- ${p.title} (${p.brand}) - Category: ${p.category ? p.category.name : 'None'}, Price: ${p.price}`);
      });
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error checking DB:', err);
  }
};

checkDB();
