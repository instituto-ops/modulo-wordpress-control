const request = require('axios');

// Set environment variables directly before requiring server.js
process.env.DASHBOARD_USER = 'admin';
process.env.DASHBOARD_PASSWORD = 'secretpassword';

const app = require('./server.js');

const port = 3001; // use a different port for test

const server = app.listen(port, async () => {
    console.log(`Test server running on port ${port}`);
    let passed = false;

    // Test 1: Unauthenticated request should fail with 401
    try {
        console.log('Sending unauthenticated request to /api/wp/posts');
        await request.get(`http://localhost:${port}/api/wp/posts`);
        console.error('❌ FAIL: Request succeeded but should have been blocked');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASS: Unauthenticated request was blocked with 401');
            passed = true;
        } else {
            console.error(`❌ FAIL: Unexpected error: ${error.message}`);
            if (error.response) console.error(`Status code: ${error.response.status}`);
        }
    }

    server.close(() => {
        if (passed) {
            console.log('Test completed successfully.');
            process.exit(0);
        } else {
            console.error('Test failed.');
            process.exit(1);
        }
    });
});
