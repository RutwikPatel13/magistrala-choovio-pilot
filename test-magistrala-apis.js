#!/usr/bin/env node

// Comprehensive Magistrala API Testing Script
// Tests all integrated APIs and features

const readline = require('readline');

// Configuration
const CONFIG = {
  // Magistrala instance configuration
  MAGISTRALA_BASE_URL: process.env.MAGISTRALA_BASE_URL || 'http://localhost',
  
  // Service ports (standard Magistrala deployment)
  USERS_PORT: process.env.MAGISTRALA_USERS_PORT || '9002',
  THINGS_PORT: process.env.MAGISTRALA_THINGS_PORT || '9000',
  CHANNELS_PORT: process.env.MAGISTRALA_CHANNELS_PORT || '9005',
  HTTP_PORT: process.env.MAGISTRALA_HTTP_PORT || '8008',
  READER_PORT: process.env.MAGISTRALA_READER_PORT || '9009',
  BOOTSTRAP_PORT: process.env.MAGISTRALA_BOOTSTRAP_PORT || '9013',
  CONSUMERS_PORT: process.env.MAGISTRALA_CONSUMERS_PORT || '9016',
  PROVISION_PORT: process.env.MAGISTRALA_PROVISION_PORT || '9020',
  RULES_PORT: process.env.MAGISTRALA_RULES_PORT || '9019',
  REPORTS_PORT: process.env.MAGISTRALA_REPORTS_PORT || '9021',
  
  // Test credentials
  TEST_USER_EMAIL: 'test@magistrala.com',
  TEST_USER_PASSWORD: 'testpass123'
};

// API endpoints
const ENDPOINTS = {
  users: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.USERS_PORT}`,
  things: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.THINGS_PORT}`,
  channels: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.CHANNELS_PORT}`,
  http: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.HTTP_PORT}`,
  readers: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.READER_PORT}`,
  bootstrap: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.BOOTSTRAP_PORT}`,
  consumers: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.CONSUMERS_PORT}`,
  provision: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.PROVISION_PORT}`,
  rules: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.RULES_PORT}`,
  reports: `${CONFIG.MAGISTRALA_BASE_URL}:${CONFIG.REPORTS_PORT}`
};

// Test state
let authToken = null;
let testThingId = null;
let testThingSecret = null;
let testChannelId = null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData = null;
    
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // Response is not JSON
    }
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: jsonData || data,
      headers: response.headers
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      data: null
    };
  }
};

const logTest = (testName, status, details = '') => {
  const timestamp = new Date().toISOString();
  const statusEmoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`[${timestamp}] ${statusEmoji} ${testName} - ${status}`);
  if (details) {
    console.log(`    ${details}`);
  }
};

// Test functions
const testServiceHealthCheck = async (serviceName, endpoint) => {
  console.log(`\\n🔍 Testing ${serviceName} service health...`);
  
  // Try common health check endpoints
  const healthEndpoints = [
    `${endpoint}/health`,
    `${endpoint}/version`,
    `${endpoint}`,
    `${endpoint}/status`
  ];
  
  for (const healthUrl of healthEndpoints) {
    const result = await makeRequest(healthUrl);
    
    if (result.ok) {
      logTest(`${serviceName} Health Check`, 'PASS', `Endpoint: ${healthUrl}, Status: ${result.status}`);
      return true;
    }
  }
  
  logTest(`${serviceName} Health Check`, 'FAIL', `All health endpoints failed for ${endpoint}`);
  return false;
};

const testAuthentication = async () => {
  console.log('\\n🔐 Testing Authentication...');
  
  // Test user creation
  const createUserResult = await makeRequest(`${ENDPOINTS.users}/users`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      credentials: {
        identity: CONFIG.TEST_USER_EMAIL,
        secret: CONFIG.TEST_USER_PASSWORD
      }
    })
  });
  
  if (createUserResult.ok) {
    logTest('User Creation', 'PASS', `Created user: ${CONFIG.TEST_USER_EMAIL}`);
  } else if (createUserResult.status === 409) {
    logTest('User Creation', 'WARN', 'User already exists (expected)');
  } else {
    logTest('User Creation', 'FAIL', `Status: ${createUserResult.status}`);
  }
  
  // Test login
  const loginResult = await makeRequest(`${ENDPOINTS.users}/tokens/issue`, {
    method: 'POST',
    body: JSON.stringify({
      identity: CONFIG.TEST_USER_EMAIL,
      secret: CONFIG.TEST_USER_PASSWORD
    })
  });
  
  if (loginResult.ok && loginResult.data && loginResult.data.access_token) {
    authToken = loginResult.data.access_token;
    logTest('Authentication', 'PASS', 'Successfully obtained access token');
    return true;
  } else {
    logTest('Authentication', 'FAIL', `Status: ${loginResult.status}, Data: ${JSON.stringify(loginResult.data)}`);
    return false;
  }
};

const testThingsAPI = async () => {
  console.log('\\n📱 Testing Things API...');
  
  if (!authToken) {
    logTest('Things API', 'SKIP', 'No auth token available');
    return false;
  }
  
  // Create a test thing
  const createThingResult = await makeRequest(`${ENDPOINTS.things}/things`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: 'Test IoT Device',
      metadata: {
        type: 'sensor',
        protocol: 'http',
        location: 'test-lab'
      }
    })
  });
  
  if (createThingResult.ok && createThingResult.data) {
    testThingId = createThingResult.data.id;
    testThingSecret = createThingResult.data.secret;
    logTest('Create Thing', 'PASS', `Thing ID: ${testThingId}`);
  } else {
    logTest('Create Thing', 'FAIL', `Status: ${createThingResult.status}`);
    return false;
  }
  
  // List things
  const listThingsResult = await makeRequest(`${ENDPOINTS.things}/things`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (listThingsResult.ok) {
    logTest('List Things', 'PASS', `Found ${listThingsResult.data.things?.length || 0} things`);
  } else {
    logTest('List Things', 'FAIL', `Status: ${listThingsResult.status}`);
  }
  
  return true;
};

const testChannelsAPI = async () => {
  console.log('\\n📡 Testing Channels API...');
  
  if (!authToken) {
    logTest('Channels API', 'SKIP', 'No auth token available');
    return false;
  }
  
  // Create a test channel
  const createChannelResult = await makeRequest(`${ENDPOINTS.channels}/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: 'Test Channel',
      metadata: {
        type: 'data',
        protocol: 'http'
      }
    })
  });
  
  if (createChannelResult.ok && createChannelResult.data) {
    testChannelId = createChannelResult.data.id;
    logTest('Create Channel', 'PASS', `Channel ID: ${testChannelId}`);
  } else {
    logTest('Create Channel', 'FAIL', `Status: ${createChannelResult.status}`);
    return false;
  }
  
  // List channels
  const listChannelsResult = await makeRequest(`${ENDPOINTS.channels}/channels`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (listChannelsResult.ok) {
    logTest('List Channels', 'PASS', `Found ${listChannelsResult.data.channels?.length || 0} channels`);
  } else {
    logTest('List Channels', 'FAIL', `Status: ${listChannelsResult.status}`);
  }
  
  return true;
};

const testMessaging = async () => {
  console.log('\\n💬 Testing Messaging API...');
  
  if (!testThingSecret || !testChannelId) {
    logTest('Messaging API', 'SKIP', 'Missing thing secret or channel ID');
    return false;
  }
  
  // Connect thing to channel first
  const connectResult = await makeRequest(`${ENDPOINTS.channels}/connect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      thing_id: testThingId,
      channel_id: testChannelId
    })
  });
  
  if (connectResult.ok) {
    logTest('Connect Thing to Channel', 'PASS', 'Connection established');
  } else {
    logTest('Connect Thing to Channel', 'FAIL', `Status: ${connectResult.status}`);
  }
  
  // Send a test message
  const senMLMessage = [
    {
      bn: 'test-device',
      n: 'temperature',
      u: '°C',
      v: 25.5,
      t: Math.floor(Date.now() / 1000)
    }
  ];
  
  const sendMessageResult = await makeRequest(`${ENDPOINTS.http}/channels/${testChannelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Thing ${testThingSecret}`,
      'Content-Type': 'application/senml+json'
    },
    body: JSON.stringify(senMLMessage)
  });
  
  if (sendMessageResult.ok) {
    logTest('Send Message', 'PASS', 'SenML message sent successfully');
  } else {
    logTest('Send Message', 'FAIL', `Status: ${sendMessageResult.status}`);
  }
  
  // Wait a moment for message to be processed
  await delay(2000);
  
  // Read messages
  const readMessagesResult = await makeRequest(`${ENDPOINTS.readers}/channels/${testChannelId}/messages`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (readMessagesResult.ok) {
    const messageCount = readMessagesResult.data.messages?.length || 0;
    logTest('Read Messages', 'PASS', `Retrieved ${messageCount} messages`);
  } else {
    logTest('Read Messages', 'FAIL', `Status: ${readMessagesResult.status}`);
  }
  
  return true;
};

const testAdvancedServices = async () => {
  console.log('\\n🚀 Testing Advanced Services...');
  
  // Test Bootstrap Service
  const bootstrapResult = await makeRequest(`${ENDPOINTS.bootstrap}/things/bootstrap`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  logTest('Bootstrap Service', bootstrapResult.ok ? 'PASS' : 'FAIL', 
    `Status: ${bootstrapResult.status}`);
  
  // Test Consumers Service
  const consumersResult = await makeRequest(`${ENDPOINTS.consumers}/consumers`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  logTest('Consumers Service', consumersResult.ok ? 'PASS' : 'FAIL', 
    `Status: ${consumersResult.status}`);
  
  // Test Rules Service
  const rulesResult = await makeRequest(`${ENDPOINTS.rules}/rules`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  logTest('Rules Service', rulesResult.ok ? 'PASS' : 'FAIL', 
    `Status: ${rulesResult.status}`);
  
  // Test Reports Service
  const reportsResult = await makeRequest(`${ENDPOINTS.reports}/configs`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  logTest('Reports Service', reportsResult.ok ? 'PASS' : 'FAIL', 
    `Status: ${reportsResult.status}`);
};

const runComprehensiveTests = async () => {
  console.log('🧪 Magistrala API Comprehensive Test Suite');
  console.log('==========================================\\n');
  
  console.log('📋 Configuration:');
  console.log(`Base URL: ${CONFIG.MAGISTRALA_BASE_URL}`);
  console.log(`Test User: ${CONFIG.TEST_USER_EMAIL}`);
  console.log('');
  
  const startTime = Date.now();
  
  // Service health checks
  console.log('🔧 Service Health Checks');
  console.log('=========================');
  
  const services = [
    ['Users', ENDPOINTS.users],
    ['Things', ENDPOINTS.things],
    ['Channels', ENDPOINTS.channels],
    ['HTTP Adapter', ENDPOINTS.http],
    ['Readers', ENDPOINTS.readers],
    ['Bootstrap', ENDPOINTS.bootstrap],
    ['Consumers', ENDPOINTS.consumers],
    ['Rules', ENDPOINTS.rules],
    ['Reports', ENDPOINTS.reports]
  ];
  
  const healthResults = [];
  for (const [name, endpoint] of services) {
    const isHealthy = await testServiceHealthCheck(name, endpoint);
    healthResults.push([name, isHealthy]);
  }
  
  // Core API tests
  console.log('\\n🔐 Core API Tests');
  console.log('==================');
  
  const authSuccess = await testAuthentication();
  const thingsSuccess = authSuccess && await testThingsAPI();
  const channelsSuccess = authSuccess && await testChannelsAPI();
  const messagingSuccess = thingsSuccess && channelsSuccess && await testMessaging();
  
  // Advanced services tests
  if (authSuccess) {
    await testAdvancedServices();
  }
  
  // Test summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\\n📊 Test Summary');
  console.log('================');
  console.log(`Total test duration: ${duration} seconds\\n`);
  
  console.log('Service Health Status:');
  healthResults.forEach(([name, healthy]) => {
    console.log(`  ${healthy ? '✅' : '❌'} ${name}`);
  });
  
  console.log('\\nCore API Status:');
  console.log(`  ${authSuccess ? '✅' : '❌'} Authentication`);
  console.log(`  ${thingsSuccess ? '✅' : '❌'} Things API`);
  console.log(`  ${channelsSuccess ? '✅' : '❌'} Channels API`);
  console.log(`  ${messagingSuccess ? '✅' : '❌'} Messaging API`);
  
  console.log('\\n🎯 Recommendations:');
  
  const healthyServices = healthResults.filter(([_, healthy]) => healthy).length;
  const totalServices = healthResults.length;
  
  if (healthyServices === totalServices) {
    console.log('✅ All services are responding - Magistrala instance appears healthy');
  } else if (healthyServices >= 4) {
    console.log('⚠️  Core services are responding - Some advanced services may not be deployed');
  } else {
    console.log('❌ Many services are not responding - Check Magistrala deployment');
  }
  
  if (authSuccess && thingsSuccess && channelsSuccess && messagingSuccess) {
    console.log('✅ All core APIs working - Dashboard should function properly');
  } else {
    console.log('⚠️  Some core APIs failed - Dashboard may have limited functionality');
  }
  
  console.log('\\n🔧 Next Steps:');
  console.log('1. Ensure Magistrala services are running and accessible');
  console.log('2. Check network connectivity and firewall settings');
  console.log('3. Verify authentication credentials and permissions');
  console.log('4. Review service logs for any error messages');
  console.log('5. Test the React dashboard with real API connections');
  
  return {
    healthyServices,
    totalServices,
    coreAPISuccess: authSuccess && thingsSuccess && channelsSuccess && messagingSuccess
  };
};

// Interactive mode
const runInteractiveMode = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  console.log('🎮 Interactive Magistrala API Testing');
  console.log('=====================================\\n');
  
  const baseUrl = await question(`Magistrala Base URL [${CONFIG.MAGISTRALA_BASE_URL}]: `);
  if (baseUrl.trim()) {
    CONFIG.MAGISTRALA_BASE_URL = baseUrl.trim();
    // Update all endpoints
    Object.keys(ENDPOINTS).forEach(key => {
      ENDPOINTS[key] = ENDPOINTS[key].replace(/^https?:\/\/[^:]+/, CONFIG.MAGISTRALA_BASE_URL);
    });
  }
  
  const email = await question(`Test user email [${CONFIG.TEST_USER_EMAIL}]: `);
  if (email.trim()) {
    CONFIG.TEST_USER_EMAIL = email.trim();
  }
  
  const password = await question(`Test user password [${CONFIG.TEST_USER_PASSWORD}]: `);
  if (password.trim()) {
    CONFIG.TEST_USER_PASSWORD = password.trim();
  }
  
  console.log('\\n🚀 Starting tests with your configuration...\\n');
  
  const results = await runComprehensiveTests();
  
  rl.close();
  return results;
};

// Main execution
const main = async () => {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    try {
      const { default: fetch, Headers, Request, Response } = await import('node-fetch');
      global.fetch = fetch;
      global.Headers = Headers;
      global.Request = Request;
      global.Response = Response;
    } catch (error) {
      console.error('❌ fetch not available. Please install node-fetch or use Node.js 18+');
      console.error('Run: npm install node-fetch');
      process.exit(1);
    }
  }
  
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await runInteractiveMode();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Magistrala API Test Suite
========================

Usage:
  node test-magistrala-apis.js [options]

Options:
  --interactive, -i    Run in interactive mode
  --help, -h          Show this help message

Environment Variables:
  MAGISTRALA_BASE_URL  Base URL of Magistrala instance (default: http://localhost)
  MAGISTRALA_USERS_PORT    Users service port (default: 9002)
  MAGISTRALA_THINGS_PORT   Things service port (default: 9000)
  MAGISTRALA_CHANNELS_PORT Channels service port (default: 9005)
  MAGISTRALA_HTTP_PORT     HTTP adapter port (default: 8008)
  MAGISTRALA_READER_PORT   Reader service port (default: 9009)

Examples:
  # Test local Magistrala instance
  node test-magistrala-apis.js

  # Test remote instance
  MAGISTRALA_BASE_URL=https://my-magistrala.com node test-magistrala-apis.js

  # Interactive mode
  node test-magistrala-apis.js --interactive
`);
  } else {
    await runComprehensiveTests();
  }
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runComprehensiveTests,
  CONFIG,
  ENDPOINTS
};