const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB using mongoose.");
    const db = mongoose.connection.db;
    const subscriptions = db.collection('subscriptions');
    
    // Get all subscriptions to see what's happening
    const docs = await subscriptions.find({}).toArray();
    console.log("All Subscription Records:");
    docs.forEach(doc => {
      console.log(`_id: ${doc._id}, id: ${doc.id}, collegeId: ${doc.collegeId}, planId: ${doc.planId}, planType: ${doc.planType}, status: ${doc.status}, providerOrderId: ${doc.providerOrderId}, providerPaymentId: ${doc.providerPaymentId}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
