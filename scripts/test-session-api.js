const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testSessionAPI() {
  try {
    console.log('🔍 Testing session validation API...');
    
    // Get the current session token from the database
    const session = await sql`
      SELECT session_token FROM admin_sessions WHERE expires_at > NOW() LIMIT 1;
    `;
    
    if (session.length === 0) {
      console.log('❌ No valid sessions found');
      return;
    }
    
    const sessionToken = session[0].session_token;
    console.log('🔑 Found session token:', sessionToken.substring(0, 20) + '...');
    
    // Test the session validation API
    const response = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET',
      headers: {
        'Cookie': `admin_session=${sessionToken}`,
      },
    });
    
    const data = await response.json();
    console.log('📡 Session API response:', data);
    console.log('📊 Response status:', response.status);
    
  } catch (error) {
    console.error('❌ Error testing session API:', error);
  }
}

testSessionAPI(); 