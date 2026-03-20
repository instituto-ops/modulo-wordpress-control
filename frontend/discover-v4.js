const https = require('https');
const key = "AIzaSyBtVFHJjN3CsUytHfRXzEqxgq5hj9hbcrQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', m => data += m);
    res.on('end', () => console.log(data));
});
