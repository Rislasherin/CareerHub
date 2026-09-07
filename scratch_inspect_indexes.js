const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careerhub";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    // In mongoose config it might use the DB name from the connection string or 'careerhub'
    const dbName = uri.split('/').pop().split('?')[0] || 'careerhub';
    const database = client.db(dbName);
    const subscriptions = database.collection('subscriptions');
    
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
    await client.close();
  }
}

run();
