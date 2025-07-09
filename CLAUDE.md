# Critical Rules - DO NOT VIOLATE

- **NEVER create mock data or simplified components** unless explicitly told to do so

- **NEVER replace existing complex components with simplified versions** - always fix the actual problem

- **ALWAYS work with the existing codebase** - do not create new simplified alternatives

- **ALWAYS find and fix the root cause** of issues instead of creating workarounds

- When debugging issues, focus on fixing the existing implementation, not replacing it

- When something doesn't work, debug and fix it - don't start over with a simple version

# TypeScript and Linting

- ALWAYS add explicit types to all function parameters, variables, and return types

- ALWAYS run `npm build` or appropriate linter command before considering any code changes complete

- Fix all linter and TypeScript errors immediately - don't leave them for the user to fix

- When making changes to multiple files, check each one for type errors

# Project Context

SuriCare is a child health monitoring application for parents and caregivers. The application consists of:

- **Frontend**: Vue 3 + Vuetify 3 + TypeScript application for the user interface
- **Backend**: FastAPI Python application providing REST APIs
- **Database**: Supabase (PostgreSQL) for data storage
- **AI Features**: Chatbot integration using Google Gemini

# Coding style

- Always keep components and composables small and focused
- use Composition API (script setup) throughout the project
- Use Pinia stores for state management
- Keep all CSS in the style directory @ `src/styles/`
- All global styles should be defined in `src/styles/_variables.scss`
- **AVOID creating unnecessary files or functions** - use and extend existing ones
- **MAINTAIN logical data hierarchies** - prefer `currentChild.growth?.height` over flattened structures
- **NEVER write repetitive code** - always consolidate and reuse patterns. If you find yourself copying code, stop and create a reusable solution
- **ALWAYS reconsider with the user** before implementing repetitive solutions

# Key configs

- Supabase configuration via environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

# Answering Style

- Please provide reasonable recommendations and suggestions at points that dont match industry standards 
