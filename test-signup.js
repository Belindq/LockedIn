const http = require('http');

const data = JSON.stringify({
    email: `test_${Date.now()}@example.com`,
    password: "password123",
    firstName: "Test",
    lastName: "User",
    age: 25,
    gender: "female",
    sexuality: "male",
    homeAddress: "Somewhere",
    locationCoordinates: { lat: 40, lng: -74 }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Signup endpoint with native http...');

const req = http.request(options, res => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', d => {
        responseBody += d;
    });

    res.on('end', () => {
        console.log('Response Body:', responseBody);
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
