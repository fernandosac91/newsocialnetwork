// Simple script to test the admin API endpoints
const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001; // The port exposed in docker-compose.yml

// Helper for HTTP requests
const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Admin token for auth
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n[${method} ${path}] Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test all admin endpoints
const runTests = async () => {
  try {
    console.log('===== TESTING ADMIN API ENDPOINTS =====');
    
    // Test 1: List all users
    console.log('\n1. Testing GET /api/admin/users');
    const usersResult = await makeRequest('/api/admin/users');
    console.log(JSON.stringify(usersResult.data, null, 2));
    
    // Test 2: List all events
    console.log('\n2. Testing GET /api/admin/events');
    const eventsResult = await makeRequest('/api/admin/events');
    console.log(JSON.stringify(eventsResult.data, null, 2));
    
    // Test 3: List all circles
    console.log('\n3. Testing GET /api/admin/circles');
    const circlesResult = await makeRequest('/api/admin/circles');
    console.log(JSON.stringify(eventsResult.data, null, 2));
    
    // Test 4: Test update user (if we have a user ID)
    if (usersResult.data && usersResult.data.length > 0) {
      const userId = usersResult.data[0].id;
      console.log(`\n4. Testing PATCH /api/admin/user/${userId}`);
      const updateResult = await makeRequest(`/api/admin/user/${userId}`, 'PATCH', {
        role: 'MODERATOR',
        status: 'APPROVED'
      });
      console.log(JSON.stringify(updateResult.data, null, 2));
    } else {
      console.log('\n4. Skipping PATCH /api/admin/user/:id (no users found)');
    }
    
    // Test 5: Test unauthorized access (without admin token)
    console.log('\n5. Testing unauthorized access');
    const unauthorizedOptions = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      }
    };
    
    await new Promise((resolve) => {
      const req = http.request(unauthorizedOptions, (res) => {
        console.log(`Unauthorized test: Status code: ${res.statusCode}`);
        resolve();
      });
      req.on('error', (error) => {
        console.error('Error:', error);
        resolve();
      });
      req.end();
    });
    
    console.log('\n===== ADMIN API TEST COMPLETE =====');
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Run the tests
runTests(); 