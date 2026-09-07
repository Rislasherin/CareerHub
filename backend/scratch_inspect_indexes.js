const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB using mongoose.");
    const db = mongoose.connection.db;
    const subscriptions = db.collection('subscriptions');
    
    const indexes = await subscriptions.indexes();
    console.log("Current indexes on subscriptions collection:");
    console.log(JSON.stringify(indexes, null, 2));

    const hasGatewaySubscriptionId = indexes.some(idx => idx.name === 'gatewaySubscriptionId_1');
    if (hasGatewaySubscriptionId) {
      console.log("Dropping gatewaySubscriptionId_1 index...");
      await subscriptions.dropIndex('gatewaySubscriptionId_1');
      console.log("Successfully dropped index.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
