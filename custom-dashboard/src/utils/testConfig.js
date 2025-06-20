// Configuration validation for testing

export const validateEnvironment = () => {
  const config = {
    apiUrl: process.env.REACT_APP_API_URL,
    wsUrl: process.env.REACT_APP_WS_URL,
    environment: process.env.REACT_APP_ENVIRONMENT,
    nodeEnv: process.env.NODE_ENV
  };

  const results = {
    config,
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check required environment variables
  if (!config.apiUrl) {
    results.errors.push('REACT_APP_API_URL is not set');
    results.isValid = false;
  }

  if (!config.wsUrl) {
    results.warnings.push('REACT_APP_WS_URL is not set - WebSocket features may not work');
  }

  // Validate URL formats
  try {
    if (config.apiUrl) {
      new URL(config.apiUrl);
    }
  } catch (e) {
    results.errors.push('REACT_APP_API_URL is not a valid URL');
    results.isValid = false;
  }

  return results;
};

export const testLocalStorage = () => {
  try {
    const testKey = '__magistrala_test__';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return value === 'test';
  } catch (e) {
    return false;
  }
};

export const testWebSocketSupport = () => {
  return typeof WebSocket !== 'undefined';
};

export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
    firefox: /Firefox/.test(ua),
    safari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
    edge: /Edg/.test(ua)
  };

  const browser = Object.keys(browsers).find(key => browsers[key]) || 'unknown';
  
  return {
    userAgent: ua,
    browser,
    version: ua.match(/(?:Chrome|Firefox|Safari|Edg)\/(\d+)/)?.[1] || 'unknown',
    mobile: /Mobile/.test(ua)
  };
};

export const testAPIConnectivity = async (baseUrl) => {
  const results = {
    health: false,
    cors: false,
    timeout: false
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);
    results.health = response.ok;
    results.cors = true;
    results.timeout = true;
  } catch (error) {
    if (error.name === 'AbortError') {
      results.timeout = false;
    } else if (error.message.includes('CORS')) {
      results.cors = false;
    }
  }

  return results;
};

export const runAllTests = async () => {
  console.log('🧪 Running Magistrala Dashboard Tests...');
  
  const envValidation = validateEnvironment();
  console.log('📝 Environment validation:', envValidation);

  const localStorageTest = testLocalStorage();
  console.log('💾 Local storage test:', localStorageTest ? '✅ Passed' : '❌ Failed');

  const webSocketTest = testWebSocketSupport();
  console.log('🔌 WebSocket support test:', webSocketTest ? '✅ Passed' : '❌ Failed');

  const browserInfo = getBrowserInfo();
  console.log('🌐 Browser info:', browserInfo);

  if (envValidation.config.apiUrl) {
    console.log('🔗 Testing API connectivity...');
    const apiTest = await testAPIConnectivity(envValidation.config.apiUrl);
    console.log('📡 API connectivity test:', apiTest);
  }

  const overallResult = {
    environment: envValidation.isValid,
    localStorage: localStorageTest,
    webSocket: webSocketTest,
    browser: browserInfo,
    timestamp: new Date().toISOString()
  };

  console.log('🎯 Overall test results:', overallResult);
  return overallResult;
};

export default {
  validateEnvironment,
  testLocalStorage,
  testWebSocketSupport,
  getBrowserInfo,
  testAPIConnectivity,
  runAllTests
};