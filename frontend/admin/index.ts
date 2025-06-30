#!/usr/bin/env node

import { SupabaseAdmin } from './SupabaseAdmin.js'

async function main() {
  const command = process.argv[2]
  
  if (!command) {
    console.log('SuriCare Admin Utilities')
    console.log('Usage: npm run admin <command>')
    console.log('')
    console.log('Commands:')
    console.log('  status     - Check current admin setup status')
    console.log('  setup      - Create admin user and link to Primary_Care_Giver ID=1')
    console.log('  reset      - Delete existing admin user and recreate')
    console.log('')
    console.log('Examples:')
    console.log('  npm run admin status')
    console.log('  npm run admin setup')
    return
  }
  
  try {
    const admin = new SupabaseAdmin()
    
    switch (command) {
      case 'status':
        await admin.checkAdminStatus()
        break
        
      case 'setup':
        console.log('🚀 Setting up admin user...\n')
        const setupResult = await admin.setupAdminUser()
        
        if (setupResult.success) {
          console.log('\n🎉 Setup successful!')
          console.log('Login credentials:')
          console.log('  Email: admin@suricare.com')
          console.log('  Password: admin123!')
          console.log('')
          console.log('✅', setupResult.message)
        } else {
          console.log('\n❌ Setup failed:', setupResult.message)
          process.exit(1)
        }
        break
        
      case 'reset':
        console.log('🔄 Resetting admin user...\n')
        
        // Find and delete existing admin user
        const existingUser = await admin.findAuthUserByEmail('admin@suricare.com')
        if (existingUser) {
          console.log('🗑️  Deleting existing admin user...')
          const deleted = await admin.deleteAuthUser(existingUser.id)
          if (deleted) {
            console.log('✅ Existing admin user deleted')
          } else {
            console.log('❌ Failed to delete existing admin user')
            process.exit(1)
          }
        }
        
        // Create new admin user
        const resetResult = await admin.setupAdminUser()
        
        if (resetResult.success) {
          console.log('\n🎉 Reset successful!')
          console.log('Login credentials:')
          console.log('  Email: admin@suricare.com')
          console.log('  Password: admin123!')
        } else {
          console.log('\n❌ Reset failed:', resetResult.message)
          process.exit(1)
        }
        break
        
      default:
        console.log(`❌ Unknown command: ${command}`)
        console.log('Run without arguments to see available commands')
        process.exit(1)
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  }
}

main()