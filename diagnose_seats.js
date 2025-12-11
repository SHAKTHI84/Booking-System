const https = require('https');

const baseUrl = 'https://booking-system-ajy9.onrender.com/api';

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
        console.log('\n--- DB Status (/api/debug/status) ---');
        const status = await request('GET', '/debug/status');
        console.log(JSON.stringify(status, null, 2));

        // 2. List All Shows
        console.log('\n--- All Shows (/api/shows) ---');
        const shows = await request('GET', '/shows');
        console.log(JSON.stringify(shows, null, 2));

        // 3. Trigger Seed
        console.log('\n--- Triggering Force Seed (/api/debug/seed) ---');
        const seed = await request('GET', '/debug/seed');
        console.log(JSON.stringify(seed, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

diagnose();
