// This file helps you find your actual Railway URL
// Run this in your browser console on your GitHub Pages site to test different URLs

const testRailwayUrls = [
  'https://elevatelearn-production.up.railway.app',
  'https://elevatelearn.up.railway.app',
  'https://elevate360-lms.up.railway.app',
  'https://elevatelearn-lms.up.railway.app',
  // Add more potential URLs here
];

async function testRailwayUrl(url: string) {
  try {
    console.log(`Testing URL: ${url}`);
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS: ${url} is working!`);
      console.log('Response:', data);
      return url;
    } else {
      console.log(`❌ FAILED: ${url} returned status ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${url} - ${error}`);
  }
  return null;
}

async function findWorkingRailwayUrl() {
  console.log('🔍 Testing Railway URLs...');
  
  for (const url of testRailwayUrls) {
    const workingUrl = await testRailwayUrl(url);
    if (workingUrl) {
      console.log(`🎉 Found working Railway URL: ${workingUrl}`);
      console.log('Update your queryClient.ts file with this URL');
      return workingUrl;
    }
  }
  
  console.log('❌ No working Railway URL found. Check your Railway deployment.');
  return null;
}

// Run the test
findWorkingRailwayUrl();
