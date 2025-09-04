// Railway URL Finder Script
// Copy and paste this into your browser console on your GitHub Pages site

const possibleUrls = [
  'https://elevatelearn-production.up.railway.app',
  'https://elevatelearn.up.railway.app',
  'https://elevate360-lms.up.railway.app',
  'https://elevatelearn-lms.up.railway.app',
  'https://elevatelearn-backend.up.railway.app',
  'https://elevate360.up.railway.app',
  'https://elevatelearn-app.up.railway.app'
];

async function testUrl(url) {
  try {
    console.log(`🔍 Testing: ${url}`);
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS: ${url}`);
      console.log('Response:', data);
      return url;
    } else {
      console.log(`❌ FAILED: ${url} - Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${url} - ${error.message}`);
  }
  return null;
}

async function findWorkingUrl() {
  console.log('🚀 Starting Railway URL test...');
  
  for (const url of possibleUrls) {
    const workingUrl = await testUrl(url);
    if (workingUrl) {
      console.log(`🎉 FOUND WORKING URL: ${workingUrl}`);
      console.log('📝 Update your queryClient.ts with this URL');
      return workingUrl;
    }
  }
  
  console.log('❌ No working Railway URL found');
  console.log('💡 Check your Railway dashboard for the correct URL');
  return null;
}

// Run the test
findWorkingUrl();
