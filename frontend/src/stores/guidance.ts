import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useSavedArticles } from '@/composables/useSavedArticles'

export interface Article {
  id: string
  title: string
  description: string
  tags: string[]
  url?: string
  source?: string
  publishedDate?: string
  domain?: string
  ai_summary?: string
  relevance_score?: number
  key_topics?: string[]
  age_appropriate?: boolean
  content_snippet?: string
}

export interface ArticleCache {
  articles: Article[]
  lastFetched: number
  childContext: {
    id: number
    name: string
    age: string
    ageInMonths: number
  }
}

export interface AIArticleResponse {
  success: boolean
  child_id: number
  child_name: string
  articles: Article[]
  total_articles: number
}

export const useGuidanceStore = defineStore('guidance', () => {
  // State
  const articleCache = ref<Record<number, ArticleCache>>({})
  const savedArticleIds = ref<Set<string>>(new Set())
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const refreshPromptVisible = ref<boolean>(false)
  const refreshPromptChild = ref<string>('')

  // AI-powered article discovery configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const AI_GUIDANCE_ENDPOINT = `${API_BASE_URL}`

  // Helper: Calculate age in months for more precise search queries
  const calculateAgeInMonths = (ageString: string): number => {
    const monthsMatch = ageString.match(/(\d+)\s*months?/)
    const yearsMatch = ageString.match(/(\d+)\s*years?/)

    if (monthsMatch) {
      return parseInt(monthsMatch[1])
    } else if (yearsMatch) {
      return parseInt(yearsMatch[1]) * 12
    }
    return 0
  }

  // Helper: Call AI agent to get child-specific articles
  const fetchAIArticles = async (childId: number, userId: number): Promise<Article[]> => {
    try {
      const response = await fetch(`${AI_GUIDANCE_ENDPOINT}/articles/${childId}?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`AI article fetch failed: ${response.statusText}`)
      }

      const data: AIArticleResponse = await response.json()
      return data.articles || []
    } catch (err) {
      console.error('Error fetching AI articles:', err)
      throw err
    }
  }

  // Helper: Refresh AI articles with force reload
  const refreshAIArticles = async (childId: number, userId: number): Promise<Article[]> => {
    try {
      const response = await fetch(`${AI_GUIDANCE_ENDPOINT}/articles/${childId}/refresh?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`AI article refresh failed: ${response.statusText}`)
      }

      const data: AIArticleResponse = await response.json()
      return data.articles || []
    } catch (err) {
      console.error('Error refreshing AI articles:', err)
      throw err
    }
  }

  // Action: Fetch articles using AI agent
  const fetchArticlesFromAI = async (childContext: ArticleCache['childContext'], userId: number): Promise<Article[]> => {
    try {
      const articles = await fetchAIArticles(childContext.id, userId)
      return articles
    } catch (err) {
      console.error('Failed to fetch articles from AI agent:', err)
      throw err
    }
  }

  // Action: Load articles for a specific child using AI agent
  const loadArticlesForChild = async (childId: number): Promise<void> => {
    // Import stores dynamically to avoid circular dependency
    const { useChildrenStore } = await import('./children')
    const { useAuthStore } = await import('./auth')
    const childrenStore = useChildrenStore()
    const authStore = useAuthStore()

    const child = childrenStore.children.find(c => c.id === childId) || childrenStore.currentChild
    if (!child) {
      error.value = 'Child not found'
      return
    }

    if (!authStore.userId) {
      error.value = 'User not authenticated'
      return
    }

    // Check if we have cached articles for this child
    const cached = articleCache.value[childId]
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    if (cached && (now - cached.lastFetched) < oneHour) {
      // Use cached articles if less than 1 hour old
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const childContext = {
        id: child.id,
        name: child.name,
        age: child.age,
        ageInMonths: calculateAgeInMonths(child.age)
      }

      const articles = await fetchArticlesFromAI(childContext, authStore.userId)

      // Cache the results
      articleCache.value[childId] = {
        articles,
        lastFetched: now,
        childContext
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load articles'
      console.error('Error loading articles:', err)

      // Fallback to default articles if AI fails
      if (!articleCache.value[childId]) {
        articleCache.value[childId] = {
          articles: getDefaultArticles(child.age),
          lastFetched: now,
          childContext: {
            id: child.id,
            name: child.name,
            age: child.age,
            ageInMonths: calculateAgeInMonths(child.age)
          }
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // Helper: Get default articles as fallback
  const getDefaultArticles = (age: string): Article[] => {
    return [
      {
        id: 'default_1',
        title: `Child Development Milestones for ${age}`,
        description: 'Understanding your child\'s developmental progress and what to expect at this age.',
        tags: ['Development', 'Milestones'],
        ai_summary: 'AI-powered content discovery is currently unavailable. This is a fallback article.',
        relevance_score: 75,
        age_appropriate: true
      },
      {
        id: 'default_2',
        title: `Nutrition Guide for ${age} Old Children`,
        description: 'Essential nutrition information and feeding guidelines for your child\'s age group.',
        tags: ['Nutrition', 'Health'],
        ai_summary: 'AI-powered content discovery is currently unavailable. This is a fallback article.',
        relevance_score: 75,
        age_appropriate: true
      },
      {
        id: 'default_3',
        title: `Sleep Patterns and Tips for ${age} Old Children`,
        description: 'Understanding sleep needs and establishing healthy sleep routines.',
        tags: ['Sleep', 'Parenting'],
        ai_summary: 'AI-powered content discovery is currently unavailable. This is a fallback article.',
        relevance_score: 75,
        age_appropriate: true
      }
    ]
  }

  // Action: Refresh articles with user confirmation using AI agent
  const refreshArticles = async (childId: number, force: boolean = false): Promise<void> => {
    if (!force) {
      // Show confirmation prompt
      const { useChildrenStore } = await import('./children')
      const childrenStore = useChildrenStore()
      const child = childrenStore.children.find(c => c.id === childId)

      if (child) {
        refreshPromptChild.value = `${child.name} (${child.age})`
        refreshPromptVisible.value = true
        return
      }
    }

    // Import auth store to get user ID
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()

    if (!authStore.userId) {
      error.value = 'User not authenticated'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Force refresh using AI agent
      const articles = await refreshAIArticles(childId, authStore.userId)

      // Update cache with fresh articles
      const { useChildrenStore } = await import('./children')
      const childrenStore = useChildrenStore()
      const child = childrenStore.children.find(c => c.id === childId)

      if (child) {
        articleCache.value[childId] = {
          articles,
          lastFetched: Date.now(),
          childContext: {
            id: child.id,
            name: child.name,
            age: child.age,
            ageInMonths: calculateAgeInMonths(child.age)
          }
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to refresh articles'
      console.error('Error refreshing articles:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Action: Confirm refresh from prompt
  const confirmRefresh = async (): Promise<void> => {
    refreshPromptVisible.value = false
    const { useChildrenStore } = await import('./children')
    const childrenStore = useChildrenStore()
    await refreshArticles(childrenStore.currentChild.id, true)
  }

  // Action: Cancel refresh prompt
  const cancelRefresh = (): void => {
    refreshPromptVisible.value = false
    refreshPromptChild.value = ''
  }

  // Helper function to get articles for a specific child ID
  const getArticlesForChild = (childId: number): Article[] => {
    const cached = articleCache.value[childId]
    return cached?.articles || []
  }

  // Getters - currentArticles will be computed in components where children store is available
  const currentArticles = computed((): Article[] => {
    // This will be empty until components provide the current child ID
    // Components should use getArticlesForChild(currentChild.id) directly
    return []
  })

  const isArticleSaved = computed(() => (articleId: string): boolean => {
    return savedArticleIds.value.has(articleId)
  })

  const savedArticles = computed((): Article[] => {
    const allArticles = Object.values(articleCache.value).flatMap(cache => cache.articles)
    return allArticles.filter(article => savedArticleIds.value.has(article.id))
  })

  // Action: Load saved articles from Supabase
  const loadSavedArticles = async (userId: number): Promise<void> => {
    const { getSavedArticleIds } = useSavedArticles()
    try {
      const savedIds = await getSavedArticleIds(userId)
      savedArticleIds.value = savedIds
    } catch (err) {
      console.error('Error loading saved articles:', err)
    }
  }

  // Action: Toggle save status with Supabase integration
  const toggleSaveArticle = async (article: Article): Promise<void> => {
    // Import auth store dynamically to avoid circular dependency
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()

    if (!authStore.userId) {
      console.warn('User not authenticated, cannot save articles')
      return
    }

    const { saveArticle, unsaveArticle } = useSavedArticles()

    try {
      if (savedArticleIds.value.has(article.id)) {
        // Remove from Supabase
        const success = await unsaveArticle(article.id, authStore.userId)
        if (success) {
          savedArticleIds.value.delete(article.id)
        }
      } else {
        // Save to Supabase
        const { useChildrenStore } = await import('./children')
        const childrenStore = useChildrenStore()
        const currentChildId = childrenStore.currentChild?.id

        const success = await saveArticle(article, authStore.userId, currentChildId)
        if (success) {
          savedArticleIds.value.add(article.id)
        }
      }
    } catch (err) {
      console.error('Error toggling article save status:', err)
    }
  }

  return {
    // State
    articleCache,
    savedArticleIds,
    isLoading,
    error,
    refreshPromptVisible,
    refreshPromptChild,

    // Getters
    currentArticles,
    getArticlesForChild,
    isArticleSaved,
    savedArticles,

    // Actions
    loadArticlesForChild,
    loadSavedArticles,
    refreshArticles,
    confirmRefresh,
    cancelRefresh,
    toggleSaveArticle
  }
})
