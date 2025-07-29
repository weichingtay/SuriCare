# SuriCare Admin Utilities

Professional admin utilities for managing Supabase Auth users and linking them to Primary_Care_Giver profiles.

## Setup

The admin utilities require environment variables:
- `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
- `.env`: `VITE_SUPABASE_SERVICE_ROLE_KEY`

## Usage

```bash
# Check current admin setup status
npm run admin status

# Create admin user and link to Primary_Care_Giver ID=1
npm run admin setup

# Reset (delete and recreate) admin user
npm run admin reset
```

## What It Does

1. **Status Command**: Shows current Primary_Care_Giver ID=1 and auth user status
2. **Setup Command**: Creates `admin@suricare.com` auth user and links to Primary_Care_Giver ID=1
3. **Reset Command**: Deletes existing admin user and recreates fresh

## Admin Credentials

After setup:
- **Email**: `admin@suricare.com`
- **Password**: `admin123!`

## Architecture

- `SupabaseAdmin.ts`: Main admin class with all utilities
- `index.ts`: CLI interface
- Uses service role key for full admin access
- Proper error handling and cleanup
- Type-safe operations

## Safety Features

- Checks for existing users before creating
- Handles orphaned links
- Cleans up on failure
- Validates environment variables
- Comprehensive status reporting