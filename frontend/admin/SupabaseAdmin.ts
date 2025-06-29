import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })
config({ path: '.env.local' })

export interface PrimaryCareGiver {
  id: number
  auth_user_id: string | null
  username: string
  email: string
  contact_number: string
  password: string | null
  relationship: string
}

export interface AdminUserResult {
  success: boolean
  user?: User
  profile?: PrimaryCareGiver
  message: string
}

export class SupabaseAdmin {
  private supabase: SupabaseClient
  
  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY')
    }
    
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  /**
   * Get Primary_Care_Giver record by ID
   */
  async getPrimaryCareGiver(id: number): Promise<PrimaryCareGiver | null> {
    try {
      const { data, error } = await this.supabase
        .from('primary_care_giver')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error(`Failed to get Primary_Care_Giver ID=${id}:`, error)
        return null
      }
      
      return data as PrimaryCareGiver
    } catch (err) {
      console.error('Unexpected error getting Primary_Care_Giver:', err)
      return null
    }
  }
  
  /**
   * List all Supabase Auth users
   */
  async listAuthUsers(): Promise<User[]> {
    try {
      const { data, error } = await this.supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('Failed to list auth users:', error)
        return []
      }
      
      return data.users
    } catch (err) {
      console.error('Unexpected error listing auth users:', err)
      return []
    }
  }
  
  /**
   * Find auth user by email
   */
  async findAuthUserByEmail(email: string): Promise<User | null> {
    const users = await this.listAuthUsers()
    return users.find(user => user.email === email) || null
  }
  
  /**
   * Create a new Supabase Auth user
   */
  async createAuthUser(email: string, password: string, userData?: { name?: string }): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userData || {}
      })
      
      if (error) {
        console.error('Failed to create auth user:', error)
        return null
      }
      
      return data.user
    } catch (err) {
      console.error('Unexpected error creating auth user:', err)
      return null
    }
  }
  
  /**
   * Delete a Supabase Auth user
   */
  async deleteAuthUser(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.admin.deleteUser(userId)
      
      if (error) {
        console.error('Failed to delete auth user:', error)
        return false
      }
      
      return true
    } catch (err) {
      console.error('Unexpected error deleting auth user:', err)
      return false
    }
  }
  
  /**
   * Link Supabase Auth user to Primary_Care_Giver record
   */
  async linkAuthUserToProfile(authUserId: string, profileId: number, updateData?: Partial<PrimaryCareGiver>): Promise<PrimaryCareGiver | null> {
    try {
      const updatePayload = {
        auth_user_id: authUserId,
        ...updateData
      }
      
      const { data, error } = await this.supabase
        .from('primary_care_giver')
        .update(updatePayload)
        .eq('id', profileId)
        .select()
        .single()
      
      if (error) {
        console.error('Failed to link auth user to profile:', error)
        return null
      }
      
      return data as PrimaryCareGiver
    } catch (err) {
      console.error('Unexpected error linking auth user to profile:', err)
      return null
    }
  }
  
  /**
   * Create admin user and link to Primary_Care_Giver ID=1
   */
  async setupAdminUser(email: string = 'admin@suricare.com', password: string = 'admin123!'): Promise<AdminUserResult> {
    try {
      console.log('🔍 Setting up admin user...')
      
      // Check if Primary_Care_Giver ID=1 exists
      const profile = await this.getPrimaryCareGiver(1)
      if (!profile) {
        return {
          success: false,
          message: 'Primary_Care_Giver ID=1 not found in database'
        }
      }
      
      console.log('✅ Found Primary_Care_Giver ID=1:', profile.username)
      
      // Check if auth user already exists
      let authUser = await this.findAuthUserByEmail(email)
      
      if (authUser) {
        console.log('⚠️  Auth user already exists:', authUser.id)
        
        // Check if already linked
        if (profile.auth_user_id === authUser.id) {
          return {
            success: true,
            user: authUser,
            profile,
            message: 'Admin user already set up and linked'
          }
        }
        
        // Link existing auth user to profile
        console.log('🔗 Linking existing auth user to profile...')
        const updatedProfile = await this.linkAuthUserToProfile(authUser.id, 1, {
          email: authUser.email || email,
          username: 'SuriCare Admin'
        })
        
        if (!updatedProfile) {
          return {
            success: false,
            message: 'Failed to link existing auth user to profile'
          }
        }
        
        return {
          success: true,
          user: authUser,
          profile: updatedProfile,
          message: 'Existing auth user linked to Primary_Care_Giver ID=1'
        }
      }
      
      // Create new auth user
      console.log('🔐 Creating new auth user...')
      authUser = await this.createAuthUser(email, password, { name: 'SuriCare Admin' })
      
      if (!authUser) {
        return {
          success: false,
          message: 'Failed to create auth user'
        }
      }
      
      console.log('✅ Auth user created:', authUser.id)
      
      // Link to profile
      console.log('🔗 Linking auth user to Primary_Care_Giver ID=1...')
      const updatedProfile = await this.linkAuthUserToProfile(authUser.id, 1, {
        email: authUser.email || email,
        username: 'SuriCare Admin'
      })
      
      if (!updatedProfile) {
        // Clean up created auth user
        await this.deleteAuthUser(authUser.id)
        return {
          success: false,
          message: 'Failed to link auth user to profile (auth user cleaned up)'
        }
      }
      
      return {
        success: true,
        user: authUser,
        profile: updatedProfile,
        message: 'Admin user created and linked successfully'
      }
      
    } catch (err) {
      console.error('Unexpected error in setupAdminUser:', err)
      return {
        success: false,
        message: `Setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    }
  }
  
  /**
   * Display current admin setup status
   */
  async checkAdminStatus(): Promise<void> {
    console.log('🔍 Checking admin setup status...\n')
    
    // Check Primary_Care_Giver ID=1
    const profile = await this.getPrimaryCareGiver(1)
    if (!profile) {
      console.log('❌ Primary_Care_Giver ID=1 not found')
      return
    }
    
    console.log('👤 Primary_Care_Giver ID=1:')
    console.log(`  Username: ${profile.username}`)
    console.log(`  Email: ${profile.email}`)
    console.log(`  Contact: ${profile.contact_number}`)
    console.log(`  Relationship: ${profile.relationship}`)
    console.log(`  Auth User ID: ${profile.auth_user_id || 'NOT LINKED'}`)
    console.log(`  Has Password: ${!!profile.password}`)
    
    // Check linked auth user
    if (profile.auth_user_id) {
      const authUsers = await this.listAuthUsers()
      const linkedUser = authUsers.find(user => user.id === profile.auth_user_id)
      
      if (linkedUser) {
        console.log('\n✅ Linked Supabase Auth User:')
        console.log(`  ID: ${linkedUser.id}`)
        console.log(`  Email: ${linkedUser.email}`)
        console.log(`  Created: ${linkedUser.created_at}`)
        console.log(`  Last Sign In: ${linkedUser.last_sign_in_at || 'Never'}`)
      } else {
        console.log('\n❌ Auth user ID exists but user not found (orphaned link)')
      }
    }
    
    // List all auth users
    const allAuthUsers = await this.listAuthUsers()
    console.log('\n📋 All Supabase Auth Users:')
    if (allAuthUsers.length === 0) {
      console.log('  No auth users found')
    } else {
      allAuthUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
    }
  }
}