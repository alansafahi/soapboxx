const https = require('https');

const postData = JSON.stringify({
  emailAddress: 'alan@soapboxsuperapp.com'
});

const options = {
  hostname: '2c924485-4bb4-4841-992a-dd991482cfcd-00-29nlce9a8jvps.kirk.replit.dev',
  port: 443,
  path: '/api/videos/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Cookie': 'connect.sid=s%3AOSIR7JyE9j2angTlAFZ2GBlP4VhFCr7O.dmrgWD7KqX8mTkS1ljvT2yU2VDEff2X5jCSXreU1UEQ'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Email request completed');
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();