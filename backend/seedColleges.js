// // backend/seedColleges.js

// require('dotenv').config();

// // ✅ Fix DNS resolution — same as server.js
// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

// const mongoose = require('mongoose');
// const College = require('./models/College');

// const colleges = [
//   { name: 'GL Bajaj Institute of Technology and Management', domain: 'glbitm.ac.in', shortName: 'GL Bajaj', city: 'Greater Noida', state: 'UP' },
//   { name: 'GL Bajaj College', domain: 'gl.ac.in', shortName: 'GL Bajaj', city: 'Mathura', state: 'UP' },
//   { name: 'Indian Institute of Technology Kanpur', domain: 'iitk.ac.in', shortName: 'IIT Kanpur', city: 'Kanpur', state: 'UP' },
//   { name: 'Indian Institute of Technology Delhi', domain: 'iitd.ac.in', shortName: 'IIT Delhi', city: 'Delhi', state: 'Delhi' },
//   { name: 'Delhi University', domain: 'du.ac.in', shortName: 'DU', city: 'Delhi', state: 'Delhi' },
//   { name: 'BITS Pilani', domain: 'bits-pilani.ac.in', shortName: 'BITS', city: 'Pilani', state: 'Rajasthan' },
//   { name: 'VIT University', domain: 'vit.ac.in', shortName: 'VIT', city: 'Vellore', state: 'Tamil Nadu' },
//   { name: 'Manipal University', domain: 'manipal.edu', shortName: 'Manipal', city: 'Manipal', state: 'Karnataka' },
//   { name: 'AKTU University', domain: 'aktu.ac.in', shortName: 'AKTU', city: 'Lucknow', state: 'UP' },
//   // ── For development/testing only — remove before production ──
//   { name: 'Test College (Dev Only)', domain: 'gmail.com', shortName: 'Test', city: 'Test', state: 'Test' },
// ];

// const seed = async () => {
//   try {
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB Connected');

//     await College.deleteMany({});
//     console.log('🗑️  Cleared existing colleges');

//     await College.insertMany(colleges);

//     console.log(`\n✅ ${colleges.length} colleges seeded successfully!\n`);
//     console.log('Colleges added:');
//     colleges.forEach(c => console.log(`  ✓ ${c.name} → ${c.domain}`));

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Seed error:', error.message);
//     process.exit(1);
//   }
// };

// seed();


// backend/removeTestCollege.js
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const College = require('./models/College');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await College.deleteOne({ domain: 'gmail.com' });
  console.log('✅ Test college removed');
  process.exit(0);
};

run();