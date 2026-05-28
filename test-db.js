// test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/suratDB';

async function testConnection() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 Testing MongoDB Connection...');
  console.log(`📡 URI: ${MONGODB_URI}`);
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!');
    console.log(`📁 Database: ${mongoose.connection.name}`);
    console.log(`🔌 Host: ${mongoose.connection.host}`);
    console.log(`📊 Port: ${mongoose.connection.port}`);
    
    // Test create a simple collection
    const db = mongoose.connection.db;
    
    // Create a test collection
    const testCollection = db.collection('test_collection');
    
    // Insert test data
    const testData = {
      test: true,
      message: 'Test connection successful',
      timestamp: new Date(),
      from: 'Node.js Application'
    };
    
    const result = await testCollection.insertOne(testData);
    console.log('✅ Test data inserted! ID:', result.insertedId);
    
    // Read test data
    const readData = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Test data read:', readData);
    
    // Delete test data
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test data deleted');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections in database:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection closed');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 MongoDB is working properly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n📌 Troubleshooting:');
    console.log('   1. Pastikan MongoDB sudah diinstall');
    console.log('   2. Jalankan MongoDB: mongod --dbpath C:\\data\\db');
    console.log('   3. Buka task manager, cek proses mongod.exe');
    console.log('   4. Cek port 27017: netstat -ano | findstr :27017');
    console.log('═══════════════════════════════════════════════════════════');
  }
}

testConnection();