const bcrypt = require('bcrypt');
const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
  try {
    console.log('Setting up initial admin user...');
    
    // Check if admin_users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('Creating admin_users table...');
      await sql`
        CREATE TABLE admin_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      await sql`
        CREATE TABLE admin_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
    }
    
    // Check if admin user already exists
    const existingUser = await sql`
      SELECT id FROM admin_users WHERE email = ${process.env.ADMIN_EMAIL || 'admin@stevenscup.com'}
    `;
    
    if (existingUser.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const email = process.env.ADMIN_EMAIL || 'admin@stevenscup.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);
    
    const [newUser] = await sql`
      INSERT INTO admin_users (email, password_hash, role, is_active)
      VALUES (${email}, ${passwordHash}, 'admin', true)
      RETURNING id, email, role
    `;
    
    console.log('✅ Admin user created successfully:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser(); 