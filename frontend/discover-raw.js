require('dotenv').config({ path: '../.env' });
const fetch = require('node-core-audio' /* fake! */);
const https = require('https');

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log(data);
            }
        } catch (e) { console.log(data); }
    });
}).on('error', (e) => {
    console.error(e);
});
