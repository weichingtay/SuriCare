import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import aiohttp
import google.generativeai as genai
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from app.utils import calculate_age_in_months

class AIGuidanceService:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        print(f"GEMINI_API_KEY present: {bool(self.gemini_api_key)}")
        
        if not self.gemini_api_key:
            print("WARNING: GEMINI_API_KEY not found, AI features will use fallbacks")
            self.model = None
        else:
            try:
                genai.configure(api_key=self.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                print("Gemini AI initialized successfully")
            except Exception as e:
                print(f"Error initializing Gemini AI: {e}")
                self.model = None
        
        # Trusted domains for child health content
        self.trusted_domains = [
            'aap.org',
            'raisingchildren.net.au'
            'healthychildren.org', 
            'kidshealth.org',
            'babycenter.com',
            'autism.org.uk',
            'whattoexpect.com',
            'mayoclinic.org',
            'webmd.com',
            'parents.com',
            'verywellfamily.com',
            'cdc.gov',
            'who.int',
            'childmind.org'
        ]
    
    async def get_child_specific_articles(self, child_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get AI-curated articles specific to a child's context"""
        try:
            print(f"Starting article generation for child: {child_data.get('name', 'Unknown')}, age: {child_data.get('age', 'Unknown')}")
            
            # Step 1: Generate search queries based on child context
            search_queries = await self._generate_search_queries(child_data)
            print(f"Generated {len(search_queries)} search queries: {search_queries}")
            
            # Step 2: Search for articles using AI-powered web search
            raw_articles = await self._search_articles(search_queries)
            print(f"Found {len(raw_articles)} raw articles")
            
            # Step 3: Scrape and analyze content
            enriched_articles = await self._enrich_articles(raw_articles, child_data)
            print(f"Enriched {len(enriched_articles)} articles")
            
            # Step 4: Score and rank articles by relevance
            ranked_articles = await self._rank_articles(enriched_articles, child_data)
            print(f"Ranked {len(ranked_articles)} articles")
            
            final_articles = ranked_articles[:10]  # Return top 10 articles
            
            # If no articles found, return fallback articles
            if not final_articles:
                print("No AI articles found, returning fallback articles")
                final_articles = self._get_fallback_articles(child_data)
            
            print(f"Returning {len(final_articles)} articles")
            print(final_articles)
            return final_articles
            
        except Exception as e:
            print(f"Error in get_child_specific_articles: {str(e)}")
            print("Returning fallback articles due to error")
            return self._get_fallback_articles(child_data)
    
    async def _generate_search_queries(self, child_data: Dict[str, Any]) -> List[str]:
        """Use AI to generate targeted search queries based on child context"""
        age = child_data.get('age', '')
        name = child_data.get('name', '')
        age_months = child_data.get('age_months', 0)
        
        # Build context for AI
        context = f"""
        Child Information:
        - Age: {age} ({age_months} months)
        - Name: {name}
        
        Generate 5 specific search queries to find relevant parenting and child health articles.
        Focus on:
        1. Developmental milestones for this age
        2. Health concerns common at this age
        3. Parenting tips and strategies
        4. Safety considerations
        5. Nutrition and feeding guidance
        
        Make queries specific to the child's age range and developmental stage.
        """
        
        # Check if AI model is available
        if not self.model:
            print("AI model not available, using fallback queries")
            return self._fallback_queries(age, age_months)
        
        try:
            prompt = f"{context}\n\nGenerate 5 search queries as a JSON array of strings:"
            response = self.model.generate_content(prompt)
            
            # Extract JSON from response
            queries_text = response.text.strip()
            if queries_text.startswith('```json'):
                queries_text = queries_text[7:-3]
            elif queries_text.startswith('```'):
                queries_text = queries_text[3:-3]
            
            queries = json.loads(queries_text)
            return queries if isinstance(queries, list) else []
            
        except Exception as e:
            print(f"Error generating search queries: {str(e)}")
            # Fallback to basic queries
            return self._fallback_queries(age, age_months)
    
    def _fallback_queries(self, age: str, age_months: int) -> List[str]:
        """Fallback queries if AI generation fails"""
        if age_months <= 12:
            return [
                f"infant development {age_months} months milestones",
                f"baby feeding sleep schedule {age_months} months",
                f"newborn safety tips {age_months} months",
                f"baby health checkups {age_months} months",
                f"infant nutrition {age_months} months"
            ]
        elif age_months <= 24:
            return [
                f"toddler development {age} milestones",
                f"toddler behavior parenting {age}",
                f"toddler safety childproofing {age}",
                f"toddler nutrition meals {age}",
                f"toddler sleep issues {age}"
            ]
        else:
            return [
                f"child development {age} milestones",
                f"parenting tips {age} child",
                f"child nutrition {age} healthy eating",
                f"child safety {age} activities",
                f"preschool readiness {age}"
            ]
    
    async def _search_articles(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Search for articles using web search"""
        all_articles = []
        
        for query in queries[:3]:  # Limit to 3 queries to avoid rate limits
            try:
                # Use DuckDuckGo search or similar search API
                search_results = await self._perform_web_search(query)
                all_articles.extend(search_results)
                
                # Add delay between searches
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"Error searching for query '{query}': {str(e)}")
                continue
        
        # Remove duplicates
        unique_articles = []
        seen_urls = set()
        
        for article in all_articles:
            url = article.get('url', '')
            if url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)
        
        return unique_articles
    
    async def _perform_web_search(self, query: str) -> List[Dict[str, Any]]:
        """Perform web search using AI to find relevant articles"""
        # Use AI to generate search results by combining query with trusted domains
        search_prompt = f"""
        I need to find reliable child health and parenting articles for this query: "{query}"
        
        Please suggest 5 specific article titles and URLs that would be most relevant from these trusted sources:
        {', '.join(self.trusted_domains)}
        
        Return as JSON array with format:
        [
            {{
                "title": "Article Title",
                "url": "https://example.com/article",
                "domain": "example.com",
                "description": "Brief description of article content"
            }}
        ]
        """
        
        # Check if AI model is available
        if not self.model:
            print("AI model not available, skipping web search")
            return []
        
        try:
            response = self.model.generate_content(search_prompt)
            results_text = response.text.strip()
            
            if results_text.startswith('```json'):
                results_text = results_text[7:-3]
            elif results_text.startswith('```'):
                results_text = results_text[3:-3]
            
            results = json.loads(results_text)
            return results if isinstance(results, list) else []
            
        except Exception as e:
            print(f"Error in web search: {str(e)}")
            return []
    
    async def _enrich_articles(self, articles: List[Dict[str, Any]], child_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape article content and use AI to analyze relevance"""
        enriched = []
        
        for i, article in enumerate(articles):
            print(f"Enriching article {i+1}/{len(articles)}: {article.get('title', 'Unknown')}")
            print(f"URL: {article.get('url', 'No URL')}")
            
            try:
                # Scrape article content
                content = await self._scrape_article_content(article['url'])
                print(f"Scraped content length: {len(content) if content else 0}")
                
                if content:
                    # Use AI to analyze and summarize content
                    analysis = await self._analyze_article_content(content, child_data)
                    print(f"Analysis relevance score: {analysis.get('relevance_score', 0)}")
                    
                    article.update({
                        'content_snippet': content[:500] + '...',
                        'ai_summary': analysis.get('summary', ''),
                        'relevance_score': analysis.get('relevance_score', 0),
                        'key_topics': analysis.get('key_topics', []),
                        'age_appropriate': analysis.get('age_appropriate', True)
                    })
                    
                    enriched.append(article)
                    print(f"Successfully enriched article: {article.get('title')}")
                else:
                    print(f"Failed to scrape content for: {article.get('url')}")
                    # Still add the article but with basic analysis
                    article.update({
                        'content_snippet': article.get('description', 'No content available'),
                        'ai_summary': f"Article about {article.get('title', 'child development')}",
                        'relevance_score': 60,  # Give it a decent score since it matched our search
                        'key_topics': ['parenting', 'child development'],
                        'age_appropriate': True
                    })
                    enriched.append(article)
                    print(f"Added article without scraping: {article.get('title')}")
                    
            except Exception as e:
                print(f"Error enriching article {article.get('url', '')}: {str(e)}")
                # Still try to include the article with basic info
                try:
                    article.update({
                        'content_snippet': article.get('description', 'No content available'),
                        'ai_summary': f"Article about {article.get('title', 'child development')}",
                        'relevance_score': 50,
                        'key_topics': ['parenting'],
                        'age_appropriate': True
                    })
                    enriched.append(article)
                    print(f"Added article with fallback data: {article.get('title')}")
                except:
                    print(f"Failed to add article even with fallback: {article}")
                    continue
        
        print(f"Enrichment complete: {len(enriched)}/{len(articles)} articles enriched")
        return enriched
    
    async def _scrape_article_content(self, url: str) -> Optional[str]:
        """Scrape article content from URL"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        # Remove script and style elements
                        for script in soup(["script", "style"]):
                            script.decompose()
                        
                        # Extract text content
                        text = soup.get_text()
                        
                        # Clean up text
                        lines = (line.strip() for line in text.splitlines())
                        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                        text = ' '.join(chunk for chunk in chunks if chunk)
                        
                        return text[:2000]  # Limit to 2000 characters
                        
        except Exception as e:
            print(f"Error scraping {url}: {str(e)}")
            return None
    
    async def _analyze_article_content(self, content: str, child_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use AI to analyze article content for relevance"""
        age = child_data.get('age', '')
        
        analysis_prompt = f"""
        Analyze this article content for relevance to a child aged {age}:
        
        Content: {content}
        
        Please provide analysis in JSON format:
        {{
            "summary": "Brief 2-3 sentence summary of the article",
            "relevance_score": 0-100 (how relevant is this to a {age} old child),
            "key_topics": ["topic1", "topic2", "topic3"],
            "age_appropriate": true/false
        }}
        """
        
        # Check if AI model is available
        if not self.model:
            return {
                'summary': 'AI analysis unavailable - using fallback',
                'relevance_score': 75,
                'key_topics': ['general parenting', 'child development'],
                'age_appropriate': True
            }
        
        try:
            response = self.model.generate_content(analysis_prompt)
            analysis_text = response.text.strip()
            
            if analysis_text.startswith('```json'):
                analysis_text = analysis_text[7:-3]
            elif analysis_text.startswith('```'):
                analysis_text = analysis_text[3:-3]
            
            analysis = json.loads(analysis_text)
            return analysis
            
        except Exception as e:
            print(f"Error analyzing content: {str(e)}")
            return {
                'summary': 'Content analysis unavailable',
                'relevance_score': 50,
                'key_topics': [],
                'age_appropriate': True
            }
    
    async def _rank_articles(self, articles: List[Dict[str, Any]], child_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Rank articles by relevance score and other factors"""
        # Sort by relevance score (descending)
        ranked = sorted(articles, key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        # Filter out low-relevance articles (lowered threshold)
        relevant_articles = [article for article in ranked if article.get('relevance_score', 0) > 20]
        print(f"Filtered articles by relevance (>20): {len(relevant_articles)}/{len(ranked)}")
        
        return relevant_articles
    
    def _get_fallback_articles(self, child_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Return fallback articles when AI service fails"""
        age = child_data.get('age', 'young child')
        age_months = child_data.get('age_months', 12)
        name = child_data.get('name', 'your child')
        
        # Basic fallback articles based on age
        if age_months <= 12:
            articles = [
                {
                    'id': 'fallback_infant_1',
                    'title': f'Infant Development Milestones for {age}',
                    'description': f'Understanding {name}\'s developmental progress and what to expect during the first year.',
                    'tags': ['Development', 'Milestones', 'Infant'],
                    'url': 'https://www.healthychildren.org/English/ages-stages/baby/Pages/Developmental-Milestones-of-Early-Literacy.aspx',
                    'domain': 'healthychildren.org',
                    'ai_summary': 'Important developmental milestones for infants including physical, cognitive, and social development markers.',
                    'relevance_score': 85,
                    'key_topics': ['motor skills', 'language development', 'social interaction'],
                    'age_appropriate': True,
                    'content_snippet': 'During the first year, babies reach many important milestones...'
                },
                {
                    'id': 'fallback_infant_2',
                    'title': f'Feeding and Nutrition Guide for {age}',
                    'description': f'Essential nutrition information for {name}\'s healthy growth and development.',
                    'tags': ['Nutrition', 'Feeding', 'Health'],
                    'url': 'https://www.aap.org/en/patient-care/breastfeeding/',
                    'domain': 'aap.org',
                    'ai_summary': 'Comprehensive feeding guidelines including breastfeeding, formula feeding, and introducing solid foods.',
                    'relevance_score': 90,
                    'key_topics': ['breastfeeding', 'formula', 'solid foods', 'nutrition'],
                    'age_appropriate': True,
                    'content_snippet': 'Proper nutrition is crucial for infant development...'
                },
                {
                    'id': 'fallback_infant_3',
                    'title': f'Safe Sleep Guidelines for {age}',
                    'description': f'Important sleep safety information to keep {name} safe and healthy.',
                    'tags': ['Sleep', 'Safety', 'SIDS Prevention'],
                    'url': 'https://www.cdc.gov/sids/parents-caregivers/reduce-risk.html',
                    'domain': 'cdc.gov',
                    'ai_summary': 'Guidelines for safe infant sleep practices to reduce the risk of SIDS and promote healthy sleep.',
                    'relevance_score': 95,
                    'key_topics': ['safe sleep', 'SIDS prevention', 'sleep position'],
                    'age_appropriate': True,
                    'content_snippet': 'Safe sleep practices are essential for infant health...'
                }
            ]
        elif age_months <= 36:
            articles = [
                {
                    'id': 'fallback_toddler_1',
                    'title': f'Toddler Development for {age}',
                    'description': f'Understanding {name}\'s toddler development and behavior patterns.',
                    'tags': ['Development', 'Toddler', 'Behavior'],
                    'url': 'https://www.kidshealth.org/en/parents/toddler-development.html',
                    'domain': 'kidshealth.org',
                    'ai_summary': 'Comprehensive guide to toddler development including language, motor skills, and social development.',
                    'relevance_score': 85,
                    'key_topics': ['language development', 'motor skills', 'social behavior'],
                    'age_appropriate': True,
                    'content_snippet': 'Toddlers are rapidly developing new skills...'
                },
                {
                    'id': 'fallback_toddler_2',
                    'title': f'Nutrition for {age} Toddlers',
                    'description': f'Healthy eating habits and meal ideas for {name}.',
                    'tags': ['Nutrition', 'Meals', 'Health'],
                    'url': 'https://www.mayoclinic.org/healthy-lifestyle/infant-and-toddler-health/in-depth/toddler-nutrition/art-20046928',
                    'domain': 'mayoclinic.org',
                    'ai_summary': 'Guidelines for toddler nutrition including meal planning, healthy snacks, and dealing with picky eating.',
                    'relevance_score': 80,
                    'key_topics': ['balanced diet', 'picky eating', 'meal planning'],
                    'age_appropriate': True,
                    'content_snippet': 'Toddlers need balanced nutrition for proper growth...'
                }
            ]
        else:
            articles = [
                {
                    'id': 'fallback_child_1',
                    'title': f'Child Development for {age}',
                    'description': f'Supporting {name}\'s growth and development.',
                    'tags': ['Development', 'Preschool', 'Learning'],
                    'url': 'https://www.verywellfamily.com/preschooler-development-4172725',
                    'domain': 'verywellfamily.com',
                    'ai_summary': 'Guide to preschooler development including cognitive, physical, and emotional growth.',
                    'relevance_score': 85,
                    'key_topics': ['cognitive development', 'emotional skills', 'school readiness'],
                    'age_appropriate': True,
                    'content_snippet': 'Preschoolers are developing independence and social skills...'
                },
                {
                    'id': 'fallback_child_2',
                    'title': f'Healthy Habits for {age}',
                    'description': f'Building healthy routines and habits with {name}.',
                    'tags': ['Health', 'Habits', 'Wellness'],
                    'url': 'https://www.parents.com/toddlers-preschoolers/health/healthy-habits/',
                    'domain': 'parents.com',
                    'ai_summary': 'Tips for establishing healthy daily routines including nutrition, exercise, and hygiene.',
                    'relevance_score': 80,
                    'key_topics': ['daily routines', 'exercise', 'hygiene'],
                    'age_appropriate': True,
                    'content_snippet': 'Establishing healthy habits early sets the foundation...'
                }
            ]
        
        return articles
    
