const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Fix 1: Update seeded subscriptions that have planType=PRO but no planId
  const r1 = await db.collection('subscriptions').updateMany(
    { planType: 'PRO', planId: { $exists: false }, status: 'ACTIVE' },
    { $set: { planId: 'plan_pro' } }
  );
  console.log('Fixed PRO subs without planId:', r1.modifiedCount);
  
  // Fix 2: Update seeded subscriptions that have planType=BASIC but no planId
  const r2 = await db.collection('subscriptions').updateMany(
    { planType: 'BASIC', planId: { $exists: false }, status: 'ACTIVE' },
    { $set: { planId: 'plan_basic' } }
  );
  console.log('Fixed BASIC subs without planId:', r2.modifiedCount);
  
  // Fix 3: Fix real payment subscription - correct collegeId (admin._id -> org._id) and add planType
  const r3 = await db.collection('subscriptions').updateOne(
    { id: '19c96fd6-a9e2-4453-a016-d4ab6506ff1a' },
    { $set: { collegeId: '6a434f3e86e5f411ad64aced', planType: 'PRO' } }
  );
  console.log('Fixed real payment sub (collegeId + planType):', r3.modifiedCount);
  
  // Verify Career college state
  const career = await db.collection('subscriptions').find({ 
    collegeId: '6a434f3e86e5f411ad64aced', 
    status: 'ACTIVE' 
  }).sort({ createdAt: -1 }).toArray();
  console.log('\n=== Career college ACTIVE subs after fix ===');
  career.forEach(s => console.log(JSON.stringify({ 
    id: s.id, 
    collegeId: s.collegeId,
    planId: s.planId, 
    planType: s.planType, 
    status: s.status 
  })));
  
  // Verify plan lookup
  const plan = await db.collection('plans').findOne({ id: 'plan_pro' });
  console.log('\n=== Pro Plan ===');
  console.log(JSON.stringify({ id: plan.id, name: plan.name, features: plan.features }));
  
  // Verify all subs now have planId
  const missingPlanId = await db.collection('subscriptions').countDocuments({ 
    status: 'ACTIVE', 
    planId: { $exists: false } 
  });
  console.log('\nActive subs still missing planId:', missingPlanId);

  await mongoose.disconnect();
}
main().catch(console.error);
