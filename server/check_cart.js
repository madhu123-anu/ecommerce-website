const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Cart = require('./models/Cart');

const checkCart = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not loaded.');
      process.exit(1);
    }
    console.log('Connecting to DB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const user = await User.findOne({ email: 'madhurimallipudi6@gmail.com' });
    if (!user) {
      console.log('User madhurimallipudi6@gmail.com not found.');
      const allUsers = await User.find({}, 'email');
      console.log('Available users:', allUsers.map(u => u.email));
      mongoose.connection.close();
      return;
    }

    console.log(`Found User: ${user.name} (${user._id})`);
    
    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    if (!cart) {
      console.log('No cart found in the DB for this user.');
    } else {
      console.log('Cart found. Items count:', cart.items.length);
      cart.items.forEach((item, index) => {
        console.log(`[${index}] Product: ${item.product ? item.product.title : 'NULL product'}, Qty: ${item.quantity}, Price: ${item.price}`);
      });
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error checking cart:', err);
  }
};

checkCart();
