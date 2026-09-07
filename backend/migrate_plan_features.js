const mongoose = require('mongoose');
require('dotenv').config();

const stringToFeatureKey = {
  "Notice Board": "NOTICE_BOARD",
  "Broadcast Emails": "BROADCAST_EMAILS",
  "Basic Resume Builder": "BASIC_RESUME_BUILDER",
  "Full AI Resume Builder": "FULL_AI_RESUME_BUILDER",
  "Mock Interview Bot": "MOCK_INTERVIEW",
  "Advanced Analytics": "ADVANCED_ANALYTICS",
  "Interview Calendar View": "INTERVIEW_CALENDAR_VIEW"
};

async function migratePlans() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerhub";

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB using mongoose.");
    const db = mongoose.connection.db;
    const plans = db.collection('plans');
    
    const docs = await plans.find({}).toArray();
    for (const doc of docs) {
      const updatedFeatures = doc.features.map(f => stringToFeatureKey[f] || f);
      console.log(`Updating plan ${doc.id} features to:`, updatedFeatures);
      
      await plans.updateOne(
        { _id: doc._id },
        { $set: { features: updatedFeatures } }
      );
    }
    console.log("Migration complete.");
  } catch (err) {
    console.error("Error migrating plans:", err);
  } finally {
    await mongoose.disconnect();
  }
}

migratePlans();
