const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function removeUsernameColumn() {
  try {
    console.log('🔧 Starting migration to remove username column...');
    
    // Check if username column exists
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'username'
      );
    `;
    
    if (!columnExists[0].exists) {
      console.log('✅ Username column already removed');
      return;
    }
    
    console.log('📋 Username column found, removing...');
    
    // Drop unique constraint on username if it exists
    try {
      await sql`ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_username_key`;
      console.log('✅ Dropped username unique constraint');
    } catch (error) {
      console.log('ℹ️  No username constraint to drop');
    }
    
    // Drop the username column
    await sql`ALTER TABLE admin_users DROP COLUMN username`;
    console.log('✅ Username column removed');
    
    // Verify the table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Updated table structure:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

removeUsernameColumn(); 