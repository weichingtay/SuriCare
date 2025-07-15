# 🔗 SuriCare Frontend-Backend Integration Guide

**A comprehensive guide for adding features and connecting Vue 3 frontend to FastAPI backend**

## 📋 Table of Contents
- [Quick Start Checklist](#quick-start-checklist)
- [Project Architecture Overview](#project-architecture-overview)
- [Step-by-Step: Adding a New Feature](#step-by-step-adding-a-new-feature)
- [Authentication & Security](#authentication--security)
- [API Patterns & Best Practices](#api-patterns--best-practices)
- [Common Issues & Solutions](#common-issues--solutions)
- [File Structure Reference](#file-structure-reference)

---

## 🚀 Quick Start Checklist

Before you start coding, make sure you have:

- [ ] **npm run demo**
but if that doesn't work, try:
- [ ] **Environment variables set**: Check `.env` files in both directories
- [ ] **Backend running**: `cd backend && uvicorn main:app --reload` (port 8000)
- [ ] **Frontend running**: `cd frontend && npm run frontend` (port 3000)
<!-- - [ ] **Database connected**: Supabase should be accessible -->
<!-- - [ ] **TypeScript happy**: Run `npm run build` to check for errors -->

---

## 🏗️ Project Architecture Overview

### **Tech Stack**
- **Frontend**: Vue 3 + TypeScript + Vuetify 3 + Pinia
- **Backend**: FastAPI + Python + SQLModel
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### **Data Flow**
```
User Interaction → Vue Component → Pinia Store → API Call → FastAPI Backend → Supabase Database
```

### **Key Directories**
```
SuriCare/
├── frontend/src/
│   ├── components/        # Vue components
│   ├── stores/           # Pinia stores (state management)
│   ├── views/            # Page components
│   └── composables/      # Reusable logic
└── backend/app/
    ├── routers/          # API routes
    ├── models.py         # Database models
    └── db.py            # Database connection
```

---

## 🛠️ Step-by-Step: Adding a New Feature

Let's walk through adding a _**"Medication Tracking"**_ feature as an example.

### **Step 1: Backend First - Create the API**

#### 1.1 Add Database Model
**File**: `backend/app/models.py`

```python
class Medication(SQLModel, table=True):
    __tablename__ = "medication"
    
    id: Optional[int] = Field(primary_key=True)
    child_id: int = Field(foreign_key="child.id")
    medication_name: str
    dosage: str
    administered_at: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

Add a new model on supabase also.

#### 1.2 Create API Router
**File**: `backend/app/routers/medications.py`

```python
from fastapi import APIRouter, HTTPException
from app.models import Medication
from app.db import get_db
from typing import List

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/{child_id}", response_model=List[Medication])
async def get_medications(child_id: int):
    """Get all medications for a child"""
    db = get_db()
    medications = db.query(Medication).filter(Medication.child_id == child_id).all()
    return medications

@router.post("/", response_model=Medication)
async def create_medication(medication: Medication):
    """Create a new medication record"""
    db = get_db()
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication
```

#### 1.3 Register Router
**File**: `backend/main.py`

```python
from app.routers import medications

app.include_router(medications.router)
```

### **Step 2: Frontend - Create the Store**

#### 2.1 Create Pinia Store
**File**: `frontend/src/stores/medications.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

interface Medication {
  id?: number
  child_id: number
  medication_name: string
  dosage: string
  administered_at: string
  notes?: string
}

export const useMedicationsStore = defineStore('medications', () => {
  // State
  const medications = ref<Medication[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getMedicationsByChild = computed(() => {
    return (childId: number) => 
      medications.value.filter(med => med.child_id === childId)
  })

  // Actions
  const fetchMedications = async (childId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/medications/${childId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Update medications for this child
      medications.value = medications.value.filter(med => med.child_id !== childId)
      medications.value.push(...data)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch medications'
      console.error('Error fetching medications:', err)
    } finally {
      loading.value = false
    }
  }

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    loading.value = true
    error.value = null
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const authStore = useAuthStore()
      
      const response = await fetch(`${baseUrl}/medications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authStore.getAuthHeaders() // Include auth if needed
        },
        body: JSON.stringify(medication)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newMedication = await response.json()
      medications.value.push(newMedication)
      
      return newMedication
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add medication'
      console.error('Error adding medication:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    medications,
    loading,
    error,
    
    // Getters
    getMedicationsByChild,
    
    // Actions
    fetchMedications,
    addMedication
  }
})
```

### **Step 3: Create the Vue Component**

#### 3.1 Create Component
**File**: `frontend/src/components/MedicationTracker.vue`

```vue
<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2">mdi-pill</v-icon>
      Medications
    </v-card-title>
    
    <v-card-text>
      <!-- Add Medication Form -->
      <v-form @submit.prevent="addMedication" v-model="formValid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="newMedication.medication_name"
              label="Medication Name"
              :rules="[rules.required]"
              required
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-text-field
              v-model="newMedication.dosage"
              label="Dosage"
              :rules="[rules.required]"
              required
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-text-field
              v-model="newMedication.administered_at"
              label="Time"
              type="datetime-local"
              :rules="[rules.required]"
              required
            />
          </v-col>
          
          <v-col cols="12">
            <v-textarea
              v-model="newMedication.notes"
              label="Notes (optional)"
              rows="2"
            />
          </v-col>
        </v-row>
        
        <v-btn
          type="submit"
          color="primary"
          :loading="medicationsStore.loading"
          :disabled="!formValid"
        >
          Add Medication
        </v-btn>
      </v-form>
      
      <!-- Medications List -->
      <v-divider class="my-4" />
      
      <div v-if="medicationsStore.loading && medications.length === 0">
        <v-skeleton-loader type="list-item-two-line" />
      </div>
      
      <div v-else-if="medications.length === 0">
        <v-alert type="info" variant="outlined">
          No medications recorded yet.
        </v-alert>
      </div>
      
      <v-list v-else>
        <v-list-item
          v-for="medication in medications"
          :key="medication.id"
        >
          <v-list-item-title>
            {{ medication.medication_name }} - {{ medication.dosage }}
          </v-list-item-title>
          
          <v-list-item-subtitle>
            {{ formatDateTime(medication.administered_at) }}
            <span v-if="medication.notes" class="ml-2">
              • {{ medication.notes }}
            </span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      
      <!-- Error Display -->
      <v-alert
        v-if="medicationsStore.error"
        type="error"
        dismissible
        @click:close="medicationsStore.error = null"
      >
        {{ medicationsStore.error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMedicationsStore } from '@/stores/medications'
import { useChildrenStore } from '@/stores/children'

// Props
interface Props {
  childId: number
}
const props = defineProps<Props>()

// Stores
const medicationsStore = useMedicationsStore()
const childrenStore = useChildrenStore()

// Form state
const formValid = ref(false)
const newMedication = ref({
  child_id: props.childId,
  medication_name: '',
  dosage: '',
  administered_at: '',
  notes: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required'
}

// Computed
const medications = computed(() => 
  medicationsStore.getMedicationsByChild(props.childId)
)

// Methods
const addMedication = async () => {
  try {
    await medicationsStore.addMedication({
      ...newMedication.value,
      child_id: props.childId
    })
    
    // Reset form
    newMedication.value = {
      child_id: props.childId,
      medication_name: '',
      dosage: '',
      administered_at: '',
      notes: ''
    }
    
  } catch (error) {
    // Error is handled in the store
    console.error('Failed to add medication:', error)
  }
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  medicationsStore.fetchMedications(props.childId)
})
</script>
```

### **Step 4: Integrate into Your App**

#### 4.1 Use in Parent Component/View
**File**: `frontend/src/views/ChildDashboard.vue`

```vue
<template>
  <div>
    <!-- Other child dashboard content -->
    
    <MedicationTracker 
      v-if="currentChild"
      :child-id="currentChild.id"
    />
  </div>
</template>

<script setup lang="ts">
import MedicationTracker from '@/components/MedicationTracker.vue'
import { useChildrenStore } from '@/stores/children'

const childrenStore = useChildrenStore()
const currentChild = computed(() => childrenStore.currentChild)
</script>
```

---

## 🔐 Authentication & Security

### **How Authentication Works**

1. **Supabase Auth**: Handles user login/registration
2. **Backend Linking**: Links Supabase users to our user profiles
3. **API Security**: Some routes require authentication

### **Getting Auth Headers** (when needed)
```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const headers = authStore.getAuthHeaders() // Returns Authorization header
```

### **Example Authenticated API Call**
```typescript
const response = await fetch(`${baseUrl}/protected-route`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...authStore.getAuthHeaders()
  },
  body: JSON.stringify(data)
})
```

---

## 🎯 API Patterns & Best Practices

### **1. Store Pattern (Recommended)**
- **Use Pinia stores** for all API calls and state management
- **Reactive state** with `ref()` and `computed()`
- **Error handling** in stores
- **Loading states** for better UX

### **2. API Call Structure**
```typescript
// ✅ Good: Complete error handling
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Update state...
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong'
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}
```

### **3. TypeScript Types**
Always define interfaces for your data:

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

interface Medication {
  id?: number
  child_id: number
  medication_name: string
  dosage: string
  administered_at: string
  notes?: string
}
```

---

## 🐛 Common Issues & Solutions


### **Issue 1: 404 Errors**
**Problem**: API endpoint not found

**Debug Steps**:
1. Check if backend is running on correct port (8000)
2. Verify route is registered in `main.py`
3. Check URL spelling in frontend

### **Issue 3: TypeScript Errors**
**Problem**: Type mismatches

**Solution**: Always run `npm run build` to catch errors early

### **Issue 4: Data Not Updating**
**Problem**: UI doesn't reflect API changes

**Debug Steps**:
1. Check if store state is reactive (`ref()` vs `reactive()`)
2. Verify API call is actually successful
3. Check if component is using computed properties correctly

### **Issue 5: Authentication Issues**
**Problem**: 401/403 errors

**Debug Steps**:
1. Check if user is logged in: `authStore.user`
2. Verify auth headers are being sent
3. Check if backend route requires authentication

---

## 📁 File Structure Reference

### **Frontend Key Files**
```
frontend/src/
├── stores/
│   ├── auth.ts           # Authentication store
│   ├── children.ts       # Children management
│   ├── chatbot.ts        # AI chat functionality
│   └── [your-store].ts   # Your new store
├── components/
│   ├── dialog/           # Form dialogs
│   │   ├── BaseCheckInDialog.vue
│   │   ├── GrowthDialog.vue
│   │   └── SleepDialog.vue
│   └── [YourComponent].vue
├── views/                # Page components
├── composables/          # Reusable logic
└── plugins/
    └── supabase.ts       # Supabase configuration
```

### **Backend Key Files**
```
backend/app/
├── routers/
│   ├── users.py          # User management
│   ├── children.py       # Children management  
│   ├── growth.py         # Growth tracking
│   ├── sleep.py          # Sleep tracking
│   ├── chat.py           # AI chat
│   └── [your-router].py  # Your new router
├── models.py             # Database models
├── db.py                 # Database connection
└── main.py               # FastAPI app setup
```

---

## 🎓 Learning Path for New Features

1. **Start with Backend**:
   - Add model to `models.py`
   - Create router in `routers/`
   - Register router in `main.py`
   - Test with FastAPI docs at http://localhost:8000/docs

2. **Create Frontend Store**:
   - Define TypeScript interfaces
   - Create Pinia store with actions
   - Handle loading/error states

3. **Build Components**:
   - Create Vue component
   - Use Vuetify for UI
   - Connect to store

4. **Integration**:
   - Add to parent components/views
   - Test functionality
   - Handle edge cases

5. **Polish**:
   - Run `npm run build` for TypeScript check
   - Add proper error handling
   - Test user experience

