const dns = require('dns');

// Force Node.js to use Google's DNS instead of system DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Hitansh_userdb:Ansh123456@cluster0.gwjazzh.mongodb.net/campusconnect?retryWrites=true&w=majority')
.then(() => {
  console.log('✅ CONNECTED SUCCESSFULLY');
  process.exit(0);
})
.catch(err => {
  console.log('❌ ERROR:', err.message);
  process.exit(1);
});