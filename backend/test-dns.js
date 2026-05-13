const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.gwjazzh.mongodb.net', (err, arr) => {
  console.log('ERR:', err);
  console.log('RESULT:', arr);
});