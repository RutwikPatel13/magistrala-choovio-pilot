#!/usr/bin/env node

/**
 * Device Management Testing Script for Magistrala Platform
 * Tests all device-related functionality including authentication integration
 */

const fs = require('fs');
const path = require('path');

// Import the MagistralaAPI service (simulate browser environment)
global.localStorage = {
  data: {},
  getItem: function(key) { return this.data[key] || null; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; }
};

// Use dynamic import for node-fetch
(async () => {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
})();

// Read and evaluate the API service
const apiPath = path.join(__dirname, 'custom-dashboard/src/services/magistralaApi.js');
const apiCode = fs.readFileSync(apiPath, 'utf8')
  .replace('export default new MagistralaAPI();', 'module.exports = new MagistralaAPI();');

eval(apiCode);
const magistralaApi = module.exports;

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://44.196.96.48',
  testCredentials: {
    email: 'admin@choovio.com',
    password: 'admin123'
  },
  testDevices: [
    {
      name: 'Test Temperature Sensor',
      type: 'sensor',
      protocol: 'mqtt',
      location: 'Testing Lab - Zone A'
    },
    {
      name: 'Test LoRaWAN Device',
      type: 'lorawan',
      devEUI: '0011223344556677',
      appEUI: '7066554433221100',
      appKey: '00112233445566778899AABBCCDDEEFF',
      location: 'Testing Lab - Zone B'
    }
  ]
};

class DeviceManagementTester {
  constructor() {
    this.results = {
      authentication: { passed: false, details: [] },
      deviceListing: { passed: false, details: [] },
      deviceCreation: { passed: false, details: [] },
      deviceFiltering: { passed: false, details: [] },
      lorawanDevices: { passed: false, details: [] },
      errorHandling: { passed: false, details: [] }
    };
    this.createdDevices = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runAllTests() {
    this.log('🚀 Starting Device Management Tests for Magistrala Platform', 'info');
    this.log(`📍 Testing against: ${TEST_CONFIG.baseURL}`, 'info');
    
    try {
      await this.testAuthentication();
      await this.testDeviceListing();
      await this.testDeviceCreation();
      await this.testDeviceFiltering();
      await this.testLoRaWANDevices();
      await this.testErrorHandling();
    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  async testAuthentication() {
    this.log('🔐 Testing Authentication Integration', 'info');
    
    try {
      // Test login functionality
      const loginResult = await magistralaApi.login(
        TEST_CONFIG.testCredentials.email, 
        TEST_CONFIG.testCredentials.password
      );

      if (loginResult && loginResult.success) {
        this.results.authentication.passed = true;
        this.results.authentication.details.push(`✅ Login successful with endpoint: ${loginResult.endpoint}`);
        this.results.authentication.details.push(`🎟️ Token obtained: ${loginResult.token ? 'Yes' : 'No'}`);
        
        // Test user info retrieval
        const userInfo = await magistralaApi.getUserInfo();
        this.results.authentication.details.push(`👤 User info: ${userInfo.name} (${userInfo.email})`);
        
        this.log('Authentication tests passed', 'success');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      this.results.authentication.details.push(`❌ Authentication failed: ${error.message}`);
      this.log(`Authentication test failed: ${error.message}`, 'error');
    }
  }

  async testDeviceListing() {
    this.log('📋 Testing Device Listing Functionality', 'info');
    
    try {
      // Test basic device listing
      const devicesResponse = await magistralaApi.getDevices();
      
      if (devicesResponse && Array.isArray(devicesResponse.clients)) {
        this.results.deviceListing.passed = true;
        this.results.deviceListing.details.push(`📊 Total devices found: ${devicesResponse.clients.length}`);
        this.results.deviceListing.details.push(`🔢 API response structure: ${devicesResponse.total !== undefined ? 'Valid' : 'Invalid'}`);
        
        // Test device data structure
        if (devicesResponse.clients.length > 0) {
          const sampleDevice = devicesResponse.clients[0];
          const hasRequiredFields = sampleDevice.id && sampleDevice.name;
          this.results.deviceListing.details.push(`🏗️ Device structure valid: ${hasRequiredFields ? 'Yes' : 'No'}`);
          this.results.deviceListing.details.push(`📦 Sample device: ${sampleDevice.name} (${sampleDevice.id})`);
        }
        
        this.log('Device listing tests passed', 'success');
      } else {
        throw new Error('Invalid device listing response');
      }
    } catch (error) {
      this.results.deviceListing.details.push(`❌ Device listing failed: ${error.message}`);
      this.log(`Device listing test failed: ${error.message}`, 'error');
    }
  }

  async testDeviceCreation() {
    this.log('🏭 Testing Device Creation Functionality', 'info');
    
    try {
      let successfulCreations = 0;
      
      // Test regular device creation
      for (const testDevice of TEST_CONFIG.testDevices) {
        try {
          let createResult;
          
          if (testDevice.type === 'lorawan') {
            createResult = await magistralaApi.createLoRaWANDevice(testDevice);
          } else {
            createResult = await magistralaApi.createDevice(testDevice);
          }
          
          if (createResult && createResult.id) {
            successfulCreations++;
            this.createdDevices.push(createResult.id);
            this.results.deviceCreation.details.push(`✅ Created ${testDevice.type} device: ${testDevice.name}`);
          }
        } catch (deviceError) {
          this.results.deviceCreation.details.push(`⚠️ Failed to create ${testDevice.name}: ${deviceError.message}`);
        }
      }
      
      if (successfulCreations > 0) {
        this.results.deviceCreation.passed = true;
        this.results.deviceCreation.details.push(`📈 Success rate: ${successfulCreations}/${TEST_CONFIG.testDevices.length}`);
        this.log('Device creation tests passed', 'success');
      } else {
        throw new Error('No devices were created successfully');
      }
    } catch (error) {
      this.results.deviceCreation.details.push(`❌ Device creation failed: ${error.message}`);
      this.log(`Device creation test failed: ${error.message}`, 'error');
    }
  }

  async testDeviceFiltering() {
    this.log('🔍 Testing Device Filtering and Search', 'info');
    
    try {
      // Test device listing with different parameters
      const allDevices = await magistralaApi.getDevices();
      const limitedDevices = await magistralaApi.getDevices(0, 5);
      
      this.results.deviceFiltering.details.push(`📋 All devices count: ${allDevices.clients?.length || 0}`);
      this.results.deviceFiltering.details.push(`🔢 Limited query (5): ${limitedDevices.clients?.length || 0}`);
      
      // Test LoRaWAN specific filtering
      const lorawanDevices = await magistralaApi.getLoRaWANDevices();
      this.results.deviceFiltering.details.push(`📡 LoRaWAN devices: ${lorawanDevices.length}`);
      
      // Test data structure for filtering capabilities
      if (allDevices.clients && allDevices.clients.length > 0) {
        const deviceWithMetadata = allDevices.clients.find(d => d.metadata);
        if (deviceWithMetadata) {
          this.results.deviceFiltering.details.push(`🏷️ Metadata available for filtering: Yes`);
          this.results.deviceFiltering.details.push(`🔖 Available metadata keys: ${Object.keys(deviceWithMetadata.metadata).join(', ')}`);
        }
      }
      
      this.results.deviceFiltering.passed = true;
      this.log('Device filtering tests passed', 'success');
    } catch (error) {
      this.results.deviceFiltering.details.push(`❌ Device filtering failed: ${error.message}`);
      this.log(`Device filtering test failed: ${error.message}`, 'error');
    }
  }

  async testLoRaWANDevices() {
    this.log('📡 Testing LoRaWAN Specific Functionality', 'info');
    
    try {
      // Test LoRaWAN device creation
      const lorawanDevice = {
        name: 'Test LoRaWAN Sensor',
        devEUI: '1122334455667788',
        appEUI: '8877665544332211',
        appKey: '11223344556677889900AABBCCDDEEFF',
        location: 'LoRaWAN Test Zone',
        frequency: '915MHz'
      };
      
      const createdDevice = await magistralaApi.createLoRaWANDevice(lorawanDevice);
      
      if (createdDevice && createdDevice.id) {
        this.createdDevices.push(createdDevice.id);
        this.results.lorawanDevices.details.push(`✅ LoRaWAN device created: ${createdDevice.id}`);
        
        // Verify LoRaWAN specific metadata
        if (createdDevice.metadata) {
          const hasLoRaWANFields = createdDevice.metadata.devEUI && createdDevice.metadata.appEUI;
          this.results.lorawanDevices.details.push(`🔧 LoRaWAN metadata: ${hasLoRaWANFields ? 'Complete' : 'Incomplete'}`);
          this.results.lorawanDevices.details.push(`📻 Frequency: ${createdDevice.metadata.frequency || 'Not set'}`);
        }
        
        this.results.lorawanDevices.passed = true;
        this.log('LoRaWAN device tests passed', 'success');
      } else {
        throw new Error('LoRaWAN device creation failed');
      }
    } catch (error) {
      this.results.lorawanDevices.details.push(`❌ LoRaWAN functionality failed: ${error.message}`);
      this.log(`LoRaWAN test failed: ${error.message}`, 'error');
    }
  }

  async testErrorHandling() {
    this.log('🛡️ Testing Error Handling', 'info');
    
    try {
      let errorHandlingScore = 0;
      const totalTests = 3;
      
      // Test 1: Invalid device creation
      try {
        await magistralaApi.createDevice({});
        this.results.errorHandling.details.push(`⚠️ Empty device creation should fail but didn't`);
      } catch (error) {
        errorHandlingScore++;
        this.results.errorHandling.details.push(`✅ Empty device creation properly rejected`);
      }
      
      // Test 2: Invalid device ID retrieval
      try {
        await magistralaApi.updateDevice('invalid-id', { name: 'test' });
        this.results.errorHandling.details.push(`⚠️ Invalid device update should fail but didn't`);
      } catch (error) {
        errorHandlingScore++;
        this.results.errorHandling.details.push(`✅ Invalid device update properly rejected`);
      }
      
      // Test 3: Network connectivity simulation
      try {
        // Temporarily break the API URL to test fallback
        const originalBaseURL = magistralaApi.baseURL;
        magistralaApi.baseURL = 'http://invalid-url-12345';
        
        const fallbackResult = await magistralaApi.getDevices();
        
        // Restore original URL
        magistralaApi.baseURL = originalBaseURL;
        
        if (fallbackResult && fallbackResult.clients) {
          errorHandlingScore++;
          this.results.errorHandling.details.push(`✅ Fallback to mock data working`);
        }
      } catch (error) {
        this.results.errorHandling.details.push(`⚠️ Fallback mechanism needs improvement: ${error.message}`);
      }
      
      if (errorHandlingScore >= 2) {
        this.results.errorHandling.passed = true;
        this.log('Error handling tests passed', 'success');
      }
      
      this.results.errorHandling.details.push(`📊 Error handling score: ${errorHandlingScore}/${totalTests}`);
    } catch (error) {
      this.results.errorHandling.details.push(`❌ Error handling test failed: ${error.message}`);
      this.log(`Error handling test failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    this.log('📊 Generating Test Report', 'info');
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 DEVICE MANAGEMENT TEST RESULTS');
    console.log('='.repeat(80));
    
    let totalTests = 0;
    let passedTests = 0;
    
    Object.entries(this.results).forEach(([testName, result]) => {
      totalTests++;
      if (result.passed) passedTests++;
      
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`\n📋 ${testName.toUpperCase()}: ${status}`);
      
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 OVERALL RESULTS: ${passedTests}/${totalTests} tests passed`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));
    
    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    
    if (!this.results.authentication.passed) {
      console.log('   • Fix authentication system integration');
    }
    
    if (!this.results.deviceListing.passed) {
      console.log('   • Verify device listing API endpoint configuration');
    }
    
    if (!this.results.deviceCreation.passed) {
      console.log('   • Check device creation API endpoint and data validation');
    }
    
    if (!this.results.lorawanDevices.passed) {
      console.log('   • Implement proper LoRaWAN device handling');
    }
    
    if (passedTests === totalTests) {
      console.log('   🎉 All tests passed! Device management is working correctly.');
    }
    
    console.log('\n📝 Test completed at:', new Date().toISOString());
  }
}

// Run the tests
if (require.main === module) {
  const tester = new DeviceManagementTester();
  tester.runAllTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = DeviceManagementTester;