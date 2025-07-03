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

class AIGuidanceService:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Trusted domains for child health content
        self.trusted_domains = [
            'aap.org',
            'healthychildren.org', 
            'kidshealth.org',
            'babycenter.com',
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
            # Step 1: Generate search queries based on child context
            search_queries = await self._generate_search_queries(child_data)
            
            # Step 2: Search for articles using AI-powered web search
            raw_articles = await self._search_articles(search_queries)
            
            # Step 3: Scrape and analyze content
            enriched_articles = await self._enrich_articles(raw_articles, child_data)
            
            # Step 4: Score and rank articles by relevance
            ranked_articles = await self._rank_articles(enriched_articles, child_data)
            
            return ranked_articles[:10]  # Return top 10 articles
            
        except Exception as e:
            print(f"Error in get_child_specific_articles: {str(e)}")
            return []
    
    async def _generate_search_queries(self, child_data: Dict[str, Any]) -> List[str]:
        """Use AI to generate targeted search queries based on child context"""
        age = child_data.get('age', '')
        name = child_data.get('name', '')
        
        # Calculate age in months for more precise queries
        age_months = self._calculate_age_months(age)
        
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
        
        for article in articles:
            try:
                # Scrape article content
                content = await self._scrape_article_content(article['url'])
                
                if content:
                    # Use AI to analyze and summarize content
                    analysis = await self._analyze_article_content(content, child_data)
                    
                    article.update({
                        'content_snippet': content[:500] + '...',
                        'ai_summary': analysis.get('summary', ''),
                        'relevance_score': analysis.get('relevance_score', 0),
                        'key_topics': analysis.get('key_topics', []),
                        'age_appropriate': analysis.get('age_appropriate', True)
                    })
                    
                    enriched.append(article)
                    
            except Exception as e:
                print(f"Error enriching article {article.get('url', '')}: {str(e)}")
                continue
        
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
        
        # Filter out low-relevance articles
        relevant_articles = [article for article in ranked if article.get('relevance_score', 0) > 30]
        
        return relevant_articles
    
    def _calculate_age_months(self, age_string: str) -> int:
        """Calculate age in months from age string"""
        months_match = re.search(r'(\d+)\s*months?', age_string)
        years_match = re.search(r'(\d+)\s*years?', age_string)
        
        if months_match:
            return int(months_match.group(1))
        elif years_match:
            return int(years_match.group(1)) * 12
        return 0