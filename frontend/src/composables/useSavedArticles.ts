import { supabase } from '@/plugins/supabase'
import type { Article } from '@/stores/guidance'

export interface SavedArticleRecord {
  id?: number
  user_id: number
  article_id: string
  article_data: Article
  saved_at: string
  child_id?: number
}

export function useSavedArticles() {
  // Save an article to Supabase
  const saveArticle = async (article: Article, userId: number, childId?: number): Promise<boolean> => {
    try {
      const savedArticle: Omit<SavedArticleRecord, 'id'> = {
        user_id: userId,
        article_id: article.id,
        article_data: article,
        saved_at: new Date().toISOString(),
        child_id: childId
      }

      const { error } = await supabase
        .from('saved_articles')
        .insert([savedArticle])

      if (error) {
        console.error('Error saving article to Supabase:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Unexpected error saving article:', err)
      return false
    }
  }

  // Remove a saved article from Supabase
  const unsaveArticle = async (articleId: string, userId: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId)

      if (error) {
        console.error('Error removing saved article from Supabase:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Unexpected error removing saved article:', err)
      return false
    }
  }

  // Get all saved articles for a user
  const getSavedArticles = async (userId: number): Promise<Article[]> => {
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('article_data')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved articles from Supabase:', error)
        return []
      }

      return data?.map(record => record.article_data as Article) || []
    } catch (err) {
      console.error('Unexpected error fetching saved articles:', err)
      return []
    }
  }

  // Get saved article IDs for a user (for quick lookup)
  const getSavedArticleIds = async (userId: number): Promise<Set<string>> => {
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching saved article IDs from Supabase:', error)
        return new Set()
      }

      return new Set(data?.map(record => record.article_id) || [])
    } catch (err) {
      console.error('Unexpected error fetching saved article IDs:', err)
      return new Set()
    }
  }

  // Check if a specific article is saved by a user
  const isArticleSaved = async (articleId: string, userId: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .limit(1)

      if (error) {
        console.error('Error checking if article is saved:', error)
        return false
      }

      return (data?.length || 0) > 0
    } catch (err) {
      console.error('Unexpected error checking saved article:', err)
      return false
    }
  }

  // Get saved articles for a specific child
  const getSavedArticlesForChild = async (userId: number, childId: number): Promise<Article[]> => {
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('article_data')
        .eq('user_id', userId)
        .eq('child_id', childId)
        .order('saved_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved articles for child from Supabase:', error)
        return []
      }

      return data?.map(record => record.article_data as Article) || []
    } catch (err) {
      console.error('Unexpected error fetching saved articles for child:', err)
      return []
    }
  }

  return {
    saveArticle,
    unsaveArticle,
    getSavedArticles,
    getSavedArticleIds,
    isArticleSaved,
    getSavedArticlesForChild
  }
}