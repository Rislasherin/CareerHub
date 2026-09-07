const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB using mongoose.");
    const db = mongoose.connection.db;
    const plans = db.collection('plans');
    
    const docs = await plans.find({}).toArray();
    console.log("All Plan Records:");
    docs.forEach(doc => {
      console.log(`id: ${doc.id}, name: ${doc.name}, planType: ${doc.planType}, features: ${JSON.stringify(doc.features)}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
