const https = require('https');

const baseUrl = 'https://booking-system-ajy9.onrender.com';

function request(method, path) {
    return new Promise((resolve, reject) => {
        const req = https.request(`${baseUrl}${path}`, { method }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data); // Return raw text if not JSON
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function diagnose() {
    console.log('🔍 Diagnosing Booking System...');

    try {
        // 1. Check DB Counts
        console.log('\n--- Health Check (/health) ---');
        const status = await request('GET', '/health');
        console.log(JSON.stringify(status, null, 2));

        // 2. Trigger Seed
        console.log('\n--- Triggering Emergency Fix (/emergency-fix) ---');
        const seed = await request('GET', '/emergency-fix');
        console.log(JSON.stringify(seed, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

diagnose();
