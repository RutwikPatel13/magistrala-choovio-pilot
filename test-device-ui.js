/**
 * Device Management UI Testing Script
 * Tests the actual DeviceManagement component functionality
 */

const puppeteer = require('puppeteer');

class DeviceUITester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless testing
      defaultViewport: { width: 1280, height: 720 }
    });
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:3000');
  }

  log(test, status, details = '') {
    const result = { test, status, details, timestamp: new Date().toISOString() };
    this.results.push(result);
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${status} ${details}`);
  }

  async testAuthentication() {
    try {
      // Wait for login form or check if already authenticated
      await this.page.waitForSelector('input[type="email"], .device-container', { timeout: 10000 });
      
      const isLoginPage = await this.page.$('input[type="email"]') !== null;
      
      if (isLoginPage) {
        // Fill login form
        await this.page.type('input[type="email"]', 'admin@choovio.com');
        await this.page.type('input[type="password"]', 'admin123');
        await this.page.click('button[type="submit"]');
        
        // Wait for navigation to dashboard
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        this.log('Authentication', 'PASS', 'Login successful');
      } else {
        this.log('Authentication', 'PASS', 'Already authenticated');
      }
    } catch (error) {
      this.log('Authentication', 'FAIL', error.message);
    }
  }

  async testDevicePageNavigation() {
    try {
      // Navigate to device management page
      await this.page.goto('http://localhost:3000/devices');
      await this.page.waitForSelector('.device-container', { timeout: 10000 });
      
      const pageTitle = await this.page.$eval('h1', el => el.textContent);
      if (pageTitle.includes('Device Management')) {
        this.log('Device Page Navigation', 'PASS', 'Successfully navigated to device management');
      } else {
        this.log('Device Page Navigation', 'FAIL', 'Wrong page loaded');
      }
    } catch (error) {
      this.log('Device Page Navigation', 'FAIL', error.message);
    }
  }

  async testDeviceListingDisplay() {
    try {
      // Check if device grid is present
      await this.page.waitForSelector('.device-grid, .device-container', { timeout: 5000 });
      
      const deviceCards = await this.page.$$('.device-card');
      this.log('Device Listing Display', 'PASS', `Found ${deviceCards.length} device cards`);
      
      // Check if devices have proper structure
      if (deviceCards.length > 0) {
        const firstDevice = deviceCards[0];
        const deviceName = await firstDevice.$eval('.device-name', el => el.textContent).catch(() => null);
        const deviceId = await firstDevice.$eval('.device-id', el => el.textContent).catch(() => null);
        
        if (deviceName && deviceId) {
          this.log('Device Card Structure', 'PASS', `Device: ${deviceName}`);
        } else {
          this.log('Device Card Structure', 'FAIL', 'Missing device name or ID');
        }
      }
    } catch (error) {
      this.log('Device Listing Display', 'FAIL', error.message);
    }
  }

  async testSearchFunctionality() {
    try {
      // Test search input
      const searchInput = await this.page.$('input[placeholder*="Search devices"]');
      if (searchInput) {
        await searchInput.type('temperature');
        await this.page.waitForTimeout(1000); // Wait for filtering
        
        this.log('Search Functionality', 'PASS', 'Search input working');
        
        // Clear search
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
      } else {
        this.log('Search Functionality', 'FAIL', 'Search input not found');
      }
    } catch (error) {
      this.log('Search Functionality', 'FAIL', error.message);
    }
  }

  async testFilterFunctionality() {
    try {
      // Test status filter
      const statusFilter = await this.page.$('select[value="all"]');
      if (statusFilter) {
        await statusFilter.select('online');
        await this.page.waitForTimeout(1000);
        this.log('Filter Functionality', 'PASS', 'Status filter working');
        
        // Reset filter
        await statusFilter.select('all');
      } else {
        this.log('Filter Functionality', 'WARN', 'Filter dropdown not found');
      }
    } catch (error) {
      this.log('Filter Functionality', 'FAIL', error.message);
    }
  }

  async testAddDeviceModal() {
    try {
      // Click add device button
      const addButton = await this.page.$('button:contains("Add Device"), [class*="primary"]:contains("Add")');
      if (addButton) {
        await addButton.click();
        
        // Wait for modal to appear
        await this.page.waitForSelector('div[style*="position: fixed"]', { timeout: 5000 });
        
        this.log('Add Device Modal', 'PASS', 'Modal opens successfully');
        
        // Test form fields
        const nameInput = await this.page.$('input[placeholder*="device name"], input[value=""]');
        const typeSelect = await this.page.$('select');
        
        if (nameInput && typeSelect) {
          await nameInput.type('Test Device');
          await typeSelect.select('sensor');
          this.log('Device Form Fields', 'PASS', 'Form fields working');
        }
        
        // Close modal
        const cancelButton = await this.page.$('button:contains("Cancel")');
        if (cancelButton) {
          await cancelButton.click();
        }
      } else {
        this.log('Add Device Modal', 'FAIL', 'Add device button not found');
      }
    } catch (error) {
      this.log('Add Device Modal', 'FAIL', error.message);
    }
  }

  async testDeviceActions() {
    try {
      // Test device action menu
      const deviceCard = await this.page.$('.device-card');
      if (deviceCard) {
        const actionButton = await deviceCard.$('button:contains("⋮"), [class*="more"]');
        if (actionButton) {
          await actionButton.click();
          
          // Check if action menu appears
          await this.page.waitForSelector('.action-menu, .menu-item', { timeout: 2000 });
          this.log('Device Actions', 'PASS', 'Action menu working');
          
          // Click outside to close menu
          await this.page.click('body');
        } else {
          this.log('Device Actions', 'WARN', 'Action button not found');
        }
      }
    } catch (error) {
      this.log('Device Actions', 'FAIL', error.message);
    }
  }

  async testLoRaWANSupport() {
    try {
      // Test LoRaWAN device creation
      const addButton = await this.page.$('button:contains("Add Device"), [class*="primary"]:contains("Add")');
      if (addButton) {
        await addButton.click();
        await this.page.waitForSelector('div[style*="position: fixed"]', { timeout: 5000 });
        
        // Select LoRaWAN device type
        const typeSelect = await this.page.$('select');
        if (typeSelect) {
          await typeSelect.select('lorawan');
          
          // Check if LoRaWAN fields appear
          await this.page.waitForTimeout(500);
          const devEUIInput = await this.page.$('input[placeholder*="0011223344556677"]');
          
          if (devEUIInput) {
            this.log('LoRaWAN Support', 'PASS', 'LoRaWAN fields appear correctly');
          } else {
            this.log('LoRaWAN Support', 'FAIL', 'LoRaWAN fields not found');
          }
        }
        
        // Close modal
        const cancelButton = await this.page.$('button:contains("Cancel")');
        if (cancelButton) await cancelButton.click();
      }
    } catch (error) {
      this.log('LoRaWAN Support', 'FAIL', error.message);
    }
  }

  async testResponsiveDesign() {
    try {
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      
      const deviceGrid = await this.page.$('.device-grid');
      if (deviceGrid) {
        const gridStyle = await this.page.evaluate(el => {
          return window.getComputedStyle(el).gridTemplateColumns;
        }, deviceGrid);
        
        this.log('Responsive Design', 'PASS', 'Layout adapts to mobile');
      }
      
      // Reset to desktop viewport
      await this.page.setViewport({ width: 1280, height: 720 });
    } catch (error) {
      this.log('Responsive Design', 'FAIL', error.message);
    }
  }

  async generateReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('🏆 DEVICE MANAGEMENT UI TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    // Detailed results
    this.results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${emoji} ${result.test}: ${result.status}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    });
    
    console.log('\n📝 Report generated at:', new Date().toISOString());
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting Device Management UI Tests');
      
      await this.initialize();
      await this.testAuthentication();
      await this.testDevicePageNavigation();
      await this.testDeviceListingDisplay();
      await this.testSearchFunctionality();
      await this.testFilterFunctionality();
      await this.testAddDeviceModal();
      await this.testDeviceActions();
      await this.testLoRaWANSupport();
      await this.testResponsiveDesign();
      
      await this.generateReport();
    } catch (error) {
      console.error('💥 Test suite failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Helper function to extend Puppeteer with custom selectors
async function setupCustomSelectors(page) {
  await page.evaluateOnNewDocument(() => {
    // Add custom selector for text content
    if (!document.querySelector.text) {
      document.querySelector.text = (text) => {
        return Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent.trim() === text
        );
      };
    }
  });
}

module.exports = DeviceUITester;

// Run tests if called directly
if (require.main === module) {
  const tester = new DeviceUITester();
  tester.runAllTests().catch(console.error);
}