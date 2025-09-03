// Simple database connection test
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing!');
    
    // Try to query a simple table
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log('Current time:', result[0].current_time);
    
    // Test if we can access the database
    const versionResult = await sql`SELECT version()`;
    console.log('📋 PostgreSQL version:', versionResult[0].version);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('🔑 Authentication failed - check username/password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🌐 Host not found - check the hostname');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🚫 Connection refused - check if database is running');
    } else if (error.message.includes('DATABASE_URL')) {
      console.log('🔧 DATABASE_URL environment variable is missing');
    }
  }
}

// Run the test
testConnection();
