# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuriCare is a child health monitoring application for parents and caregivers. The application consists of:

- **Frontend**: Vue 3 + Vuetify 3 + TypeScript application for the user interface
- **Backend**: FastAPI Python application providing REST APIs
- **Database**: Supabase (PostgreSQL) for data storage
- **AI Features**: Chatbot integration using Google Gemini

## Architecture

### Frontend (Vue.js Application)
- **Framework**: Vue 3 with Composition API
- **UI Library**: Vuetify 3 (Material Design components)
- **State Management**: Pinia stores
- **Routing**: Vue Router with auto-generated typed routes
- **Build Tool**: Vite
- **Language**: TypeScript

**Key directories:**
- `frontend/src/components/` - Vue components organized by feature
- `frontend/src/stores/` - Pinia state management stores
- `frontend/src/pages/` - Route pages (auto-generated routing)
- `frontend/src/composables/` - Reusable composition functions
- `frontend/src/styles/` - SCSS styling with component-specific styles

**Core features:**
- Child profile management with growth tracking
- Health check-ins (sleep, meals, symptoms, growth)
- AI-powered chatbot assistant
- Parent/caregiver account management
- Personalized Health alerts and guidance articles based on child profile

### Backend (FastAPI Application)
- **Framework**: FastAPI with SQLModel
- **Database**: PostgreSQL via SQLModel/SQLAlchemy
- **Data Analysis**: Pandas and NumPy for growth metrics
- **AI Integration**: LangChain with Google Gemini for chatbot

**Key files:**
- `backend/main.py` - FastAPI application with all endpoints
- `backend/models.py` - Database models
- `backend/db.py` - Database connection and session management
- `chatbot/app/model.py` - AI chatbot implementation

**Core endpoints:**
- User and child profile management
- Growth metrics with benchmark comparisons
- Sleep tracking
- Health data analysis

### Data Architecture
- **Primary Database**: Supabase (PostgreSQL)
- **Growth Benchmarks**: Stored in `growth_benchmark` table for age/gender comparisons
- **Child Data**: Comprehensive tracking including growth, sleep, meals, symptoms
- **Real-time Features**: Supabase real-time subscriptions for live updates

## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:3000)
npm run build       # Build for production
npm run type-check  # TypeScript type checking
npm run lint        # ESLint with auto-fix
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt  # Install Python dependencies
python main.py                   # Start FastAPI server
```

### Key Configuration
- Frontend runs on port 3000
- Backend APIs should run on default FastAPI port
- Supabase configuration via environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Development Patterns

### Frontend Patterns
- **Component Organization**: Components are grouped by feature in subdirectories
- **State Management**: Each feature has its own Pinia store (children, health, meals, etc.)
- **Composables**: Reusable logic extracted into composables with `use` prefix
- **Auto-imports**: Components and composables are auto-imported via unplugin
- **Typed Routing**: Routes are automatically typed based on file structure

### Styling Approach
- **SCSS**: Component-specific styles in `src/styles/components/`
- **Vuetify Theming**: Custom theme configuration in `settings.scss`
- **Material Design**: Following Material Design 3 principles via Vuetify

### Data Flow
- **Child Selection**: Managed via `useChildrenStore` with current child tracking
- **Health Data**: Feature-specific stores (sleep, meals, growth) coordinate with backend APIs
- **Real-time Updates**: Supabase subscriptions for live data synchronization

### Backend Patterns
- **Database Operations**: Direct SQL queries with Pandas for complex analytics
- **Growth Analysis**: Age-based comparisons against benchmark data
- **Error Handling**: HTTPException for API errors with appropriate status codes

## Testing and Quality
- **Frontend**: TypeScript compilation via `vue-tsc`
- **Linting**: ESLint with Vuetify configuration
- **Build Verification**: Always run `npm run type-check` and `npm run build` before deployment

## Integration Points
- **Database**: All child and health data flows through Supabase
- **AI Chatbot**: Backend `/chat/` endpoint processes user messages via Gemini
- **Growth Analytics**: Complex growth comparisons handled by backend pandas processing
- **Real-time Features**: Frontend subscribes to Supabase changes for live updates

## Database Integration Progress
- ✅ **Phase 1 Complete**: Lookup tables setup with database-driven options
- 🟡 **Phase 2 In Progress**: Replace mock data with real database queries
- 🔲 **Phase 3 Planned**: Enhanced backend APIs
- 🔲 **Phase 4 Planned**: Real-time features and optimization
- 🔲 **Phase 5 Planned**: Authentication and multi-child support

**See `IMPLEMENTATION_PROGRESS.md` for detailed progress tracking and next steps.**

## Database Setup
Before development, ensure lookup tables are populated:
```bash
# Run database-setup.sql in Supabase SQL editor
# This populates all lookup tables for dynamic options
```

## Architecture Changes (Phase 1 Complete)
- **Lookup Data**: All form options now come from database via composables
- **Composables Added**:
  - `useLookupData.ts` - Core database queries with caching
  - `useMealOptions.ts` - Meal categories and consumption levels  
  - `usePoopOptions.ts` - Poop colors and consistency
  - `useFormOptions.ts` - Gender, relationships, access levels
  - `useSymptomOptions.ts` - Symptom types
- **Benefits**: Configurable options, better error handling, loading states, type safety
