# SuriCare Environment Variables Setup

## 🚨 Critical Environment Variables

### Frontend (`frontend/.env.local`)
```bash
# REQUIRED - Application will crash without these
VITE_SUPABASE_URL=https://yatbjsoejyosbinqvtjq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Frontend Admin (`frontend/.env`)
```bash
# REQUIRED - For admin operations only
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Backend (`backend/.env`)
```bash
# REQUIRED - Database will not connect without these
SUPABASE_PASSWORD=your-db-password
SUPABASE_POOLER_URL=your-pooler-url
SUPABASE_USER=your-db-username
SUPABASE_PORT=5432
```

### AI Chatbot (`chatbot/.env`)
```bash
# REQUIRED - AI features will fail without this
GEMINI_API_KEY=your-gemini-api-key
```

## 📋 Optional Variables (Have Fallbacks)

### Frontend
```bash
# Optional - defaults to http://localhost:3000
VITE_API_BASE_URL=your-custom-backend-url
```

## 🛠️ Quick Setup for Teammates

1. **Create the required files:**
```bash
touch frontend/.env.local
touch frontend/.env
touch backend/.env
touch chatbot/.env
```

2. **Get credentials from team lead and populate files above**

3. **Test setup:**
```bash
npm run demo
```

## ⚠️ Current Error Handling Issues

**The application has poor error handling for missing environment variables:**

- ❌ **Frontend**: No validation for Supabase config - app crashes silently
- ❌ **Backend**: Inconsistent error messages for database config  
- ❌ **Chatbot**: No validation for Gemini API key - fails silently

**If you get cryptic errors, check that ALL required environment variables above are set correctly.**
