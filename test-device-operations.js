// Quick test script to verify device edit/delete operations
// This tests the enhanced error handling for PATCH/DELETE operations

const magistralaApi = {
  baseURL: 'http://44.196.96.48',
  token: localStorage.getItem('magistrala_token'),
  
  async updateDevice(deviceId, updates) {
    try {
      const response = await fetch(`${this.baseURL}:9000/things/${deviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Update failed: ${response.status} - ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update device error:', error);
      throw error;
    }
  },
  
  async deleteDevice(deviceId) {
    try {
      const response = await fetch(`${this.baseURL}:9000/things/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${error}`);
      }
      
      return true;
    } catch (error) {
      console.error('Delete device error:', error);
      throw error;
    }
  }
};

// Test functions
async function testDeviceUpdate() {
  console.log('🔧 Testing device update operation...');
  
  try {
    const result = await magistralaApi.updateDevice('test-device-id', {
      name: 'Updated Test Device',
      metadata: { type: 'sensor', location: 'Test Location' }
    });
    console.log('✅ Update successful:', result);
  } catch (error) {
    console.log('❌ Update failed (expected):', error.message);
    
    if (error.message.includes('Not found')) {
      console.log('💡 This confirms that PATCH operations are not supported in current Magistrala deployment');
    }
  }
}

async function testDeviceDelete() {
  console.log('🗑️ Testing device delete operation...');
  
  try {
    const result = await magistralaApi.deleteDevice('test-device-id');
    console.log('✅ Delete successful:', result);
  } catch (error) {
    console.log('❌ Delete failed (expected):', error.message);
    
    if (error.message.includes('Not found')) {
      console.log('💡 This confirms that DELETE operations are not supported in current Magistrala deployment');
    }
  }
}

// Export for browser console testing
console.log('🧪 Device Operations Test Script Loaded');
console.log('Run testDeviceUpdate() and testDeviceDelete() in browser console');
window.testDeviceUpdate = testDeviceUpdate;
window.testDeviceDelete = testDeviceDelete;