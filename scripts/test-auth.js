const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testAuthTables() {
  try {
    console.log('🔍 Testing admin tables...');
    
    // Check if admin_users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `;
    
    console.log('✅ admin_users table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Check if there are any users
      const userCount = await sql`
        SELECT COUNT(*) as count FROM admin_users;
      `;
      
      console.log('👥 Number of admin users:', userCount[0].count);
      
      if (userCount[0].count > 0) {
        // Show user details
        const users = await sql`
          SELECT id, email, role, is_active, created_at 
          FROM admin_users 
          ORDER BY created_at DESC;
        `;
        
        console.log('\n👤 Admin users:');
        users.forEach(user => {
          console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
        });
        
        // Check sessions
        const sessionCount = await sql`
          SELECT COUNT(*) as count FROM admin_sessions;
        `;
        
        console.log('\n🔑 Number of sessions:', sessionCount[0].count);
        
        if (sessionCount[0].count > 0) {
          const sessions = await sql`
            SELECT user_id, session_token, expires_at, created_at 
            FROM admin_sessions 
            ORDER BY created_at DESC;
          `;
          
          console.log('\n🔐 Active sessions:');
          sessions.forEach(session => {
            const isExpired = new Date(session.expires_at) < new Date();
            console.log(`   User ID: ${session.user_id}, Expired: ${isExpired}, Expires: ${session.expires_at}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing auth tables:', error);
  }
}

testAuthTables(); 