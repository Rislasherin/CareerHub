const mongoose = require('mongoose');
require('dotenv').config();

async function testQuery() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";
  await mongoose.connect(uri);
  
  const collegeId = '6a434f3e86e5f411ad64acef';

  let doc = await mongoose.connection.db.collection('subscriptions').findOne({ collegeId: collegeId, status: 'ACTIVE' });
  console.log("Raw Sub:", doc);

  const planId = doc.planId;
  console.log("planId is:", planId, typeof planId);

  // Raw plan
  const planDoc = await mongoose.connection.db.collection('plans').findOne({ id: planId });
  console.log("Raw Plan found via db.collection:", planDoc !== null, planDoc);

  await mongoose.disconnect();
}
testQuery();
