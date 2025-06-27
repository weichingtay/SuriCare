// Simple script to create a test user in Supabase primary_care_giver table
// Run this with: node create_test_user.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL as string
const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY as string

// Validate environment variables
if (!supabaseUrl || !supabaseAnon) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnon)

async function createTestUser() {
  const testUser = {
    username: 'Test Parent',
    email: 'test@example.com', 
    contact_number: '+1234567890',
    password: 'password123', // In production, hash this!
    relationship: 'Parent',
    auth_user_id: null
  }

  try {
    // Check if user already exists
    const { data: existing, error: checkError } = await supabase
      .from('primary_care_giver')
      .select('*')
      .eq('email', testUser.email)
      .limit(1)

    if (checkError) {
      throw checkError
    }

    if (existing && existing.length > 0) {
      console.log('✅ Test user already exists:')
      console.log(`   Email: ${existing[0].email}`)
      console.log(`   Username: ${existing[0].username}`)
      return existing[0]
    }

    // Create new user
    const { data, error } = await supabase
      .from('primary_care_giver')
      .insert([testUser])
      .select()

    if (error) {
      throw error
    }

    console.log('✅ Test user created successfully!')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password: ${testUser.password}`)
    console.log(`   Username: ${testUser.username}`)
    console.log('')
    console.log('🔧 You can now use these credentials to test login:')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password: ${testUser.password}`)

    return data[0]

  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
    process.exit(1)
  }
}

// Instructions
console.log('Creating test user in Supabase primary_care_giver table...')
console.log('='.repeat(60))
console.log(`🔗 Using Supabase URL: ${supabaseUrl}`)
console.log('✅ Environment variables loaded successfully!')
console.log('='.repeat(60))

createTestUser()
  .then(() => {
    console.log('\n' + '='.repeat(60))
    console.log('✅ Setup complete! You can now test the login functionality.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }) 