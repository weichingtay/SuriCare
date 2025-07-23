import type { Article } from '@/stores/guidance'
import guidanceUrls from '@/assets/guidance_list.json'

export const VITE_USE_ALTERNATE_GUIDANCE = true
export const VITE_USE_FALLBACK_GUIDANCE = false

export interface AlternateGuidanceService {
  getArticlesForChild(childName: string, childAge: string): Article[]
  refreshArticlesForChild(childName: string, childAge: string): Article[]
}

interface ArticleData {
  title: string
  description: string
  url: string
  tags: string[]
}

// Helper function to determine which article set to use based on child profile
const getArticleSetForChild = (childName: string, childAge: string): ArticleData[] => {
  // Convert age to years for easier comparison
  const ageInYears = extractAgeInYears(childAge)
  
  // Logic based on the guidance_list.json structure:
  // PuiSim_GeneralArticles: for younger children (2 years)
  // Pang_GeneralArticles: for older children (5 years)
  // Highlighted_for_Pui_Sim: special highlight for specific cases
  
  if (childName.toLowerCase().includes('pui') || childName.toLowerCase().includes('sim')) {
    return [...guidanceUrls.PuiSim_GeneralArticles, guidanceUrls.Highlighted_for_Pui_Sim]
  } else if (childName.toLowerCase().includes('pang') || ageInYears >= 4) {
    return guidanceUrls.Pang_GeneralArticles
  } else if (ageInYears <= 3) {
    return guidanceUrls.PuiSim_GeneralArticles
  } else {
    return guidanceUrls.Pang_GeneralArticles
  }
}

// Helper function to extract age in years from age string
const extractAgeInYears = (ageString: string): number => {
  const monthsMatch = ageString.match(/(\d+)\s*months?/)
  const yearsMatch = ageString.match(/(\d+)\s*years?/)

  if (monthsMatch) {
    return Math.floor(parseInt(monthsMatch[1]) / 12)
  } else if (yearsMatch) {
    return parseInt(yearsMatch[1])
  }
  return 2 // Default to 2 years
}

// Helper function to create Article from JSON data
const createArticleFromData = (articleData: ArticleData, index: number): Article => {
  const domain = new URL(articleData.url).hostname.replace('www.', '')
  
  return {
    id: `alternate_${index}_${Date.now()}`,
    title: articleData.title,
    description: articleData.description,
    tags: articleData.tags,
    url: articleData.url,
    domain,
    source: domain,
    publishedDate: new Date().toISOString().split('T')[0],
    ai_summary: 'Curated article specifically selected for your child\'s age and development stage',
    relevance_score: 90,
    key_topics: articleData.tags,
    age_appropriate: true,
    content_snippet: articleData.description
  }
}

export const createAlternateGuidanceService = (): AlternateGuidanceService => {
  return {
    getArticlesForChild(childName: string, childAge: string): Article[] {
      const articleData = getArticleSetForChild(childName, childAge)
      return articleData.map((data, index) => createArticleFromData(data, index))
    },

    refreshArticlesForChild(childName: string, childAge: string): Article[] {
      // For refresh, we can shuffle the articles or add timestamp to make it feel fresh
      const articleData = getArticleSetForChild(childName, childAge)
      // Shuffle articles for variety on refresh
      const shuffledData = [...articleData].sort(() => Math.random() - 0.5)
      return shuffledData.map((data, index) => createArticleFromData(data, index))
    }
  }
}

export default createAlternateGuidanceService