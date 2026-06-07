const mongoose = require('mongoose');

const connectDB = async () => {
  global.useMockData = false;
  let retries = 3;
  while (retries) {
    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000, // Timeout fast if IP blocked
      });
      console.log(`✅ Mongoose connected to host: ${conn.connection.host}`);

      // Test a ping query to make sure Atlas replica set server selection works (not blocked by IP whitelist)
      try {
        console.log('Testing Atlas database replica set queries...');
        await mongoose.connection.db.admin().ping({ maxTimeMS: 2000 });
        console.log('✅ Atlas database queries verified successfully! DB is fully ONLINE.');
        global.useMockData = false;
      } catch (pingErr) {
        console.warn('⚠️ Atlas connection succeeded, but queries timed out (IP Whitelist block?).');
        console.warn('🔌 Switching server to Local Mock Database mode to keep website products working!');
        global.useMockData = true;
      }

      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err}`);
        global.useMockData = true;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected.');
        global.useMockData = true;
      });

      break;
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error('⚠️ All Atlas MongoDB connection attempts failed. Switching server to Local Mock Database mode!');
        global.useMockData = true;
        break;
      }
      console.log(`Retrying connection... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
