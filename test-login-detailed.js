const https = require('https');

function makePostRequest(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

async function testLogin() {
    const url = 'https://discord-clone-app-wcfo.onrender.com/api/auth';
    const loginData = {
        email: 'luffy@gmail.com',
        password: '123456'
    };

    console.log('Testing login API...');
    console.log('URL:', url);
    console.log('Data:', { ...loginData, password: '[REDACTED]' });

    try {
        const result = await makePostRequest(url, loginData);
        console.log('Response Status:', result.status);
        console.log('Response Headers:', result.headers);
        console.log('Response Body:', result.body);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();