const https = require('https');

const check = (path) => {
    const url = `https://booking-system-ajy9.onrender.com${path}`;
    console.log(`Checking: ${url}`);

    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Body: ${data.substring(0, 100)}... ms`);
        });
    }).on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });
};

check('/health');
setTimeout(() => check('/api/auth/status'), 1000);
