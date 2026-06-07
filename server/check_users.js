const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const users = await User.find({}).select('+password');
    console.log('Users in DB:');
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Verified: ${u.isVerified}, Active: ${u.isActive}, Password Hash: ${u.password}`);
    });
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

checkUsers();
