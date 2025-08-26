import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('.env', 'utf8');
console.log('Raw .env content:');
console.log(envContent);

// Parse environment variables manually
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

console.log('\nParsed environment variables:');
console.log(envVars);

console.log('\nDATABASE_URL:', envVars.DATABASE_URL);
