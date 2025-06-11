const http = require('http');

const postData = JSON.stringify({
  userId: 'test-info-user',
  email: 'info@soapboxsuperapp.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/send-verification-direct',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const jsonResponse = JSON.parse(data);
      console.log('Parsed JSON:', jsonResponse);
    } catch (e) {
      console.log('Not valid JSON, response length:', data.length);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();