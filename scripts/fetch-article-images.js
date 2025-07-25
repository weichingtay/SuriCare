const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Simple HTML parser to extract meta tags
function extractOGImage(html) {
  // Look for og:image meta tag
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) return ogImageMatch[1];
  
  // Look for twitter:image meta tag
  const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (twitterImageMatch) return twitterImageMatch[1];
  
  // Look for twitter:image property
  const twitterPropMatch = html.match(/<meta\s+property=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (twitterPropMatch) return twitterPropMatch[1];
  
  return null;
}

// Fetch HTML content from URL
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHTML(res.headers.location).then(resolve).catch(reject);
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Fetch Open Graph image from URL
async function fetchOGImage(url) {
  try {
    console.log(`  Fetching HTML from: ${url}`);
    const html = await fetchHTML(url);
    const imageUrl = extractOGImage(html);
    
    if (imageUrl) {
      // Handle relative URLs
      if (imageUrl.startsWith('//')) {
        return 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol + '//' + parsedUrl.hostname + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol + '//' + parsedUrl.hostname + '/' + imageUrl;
      }
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.log(`  ❌ Failed to fetch image for ${url}: ${error.message}`);
    return null;
  }
}

// Add delay between requests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateGuidanceList() {
  const jsonPath = '../frontend/src/assets/guidance_list.json';
  
  console.log('📖 Reading guidance_list.json...');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('🔍 Starting image extraction...\n');
  
  // Process each article array
  for (const [key, articles] of Object.entries(data)) {
    console.log(`Processing ${key}:`);
    
    if (Array.isArray(articles)) {
      // Handle arrays of articles
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        console.log(`  [${i + 1}/${articles.length}] ${article.title}`);
        
        const imageUrl = await fetchOGImage(article.url);
        if (imageUrl) {
          article.image = imageUrl;
          console.log(`  ✅ Found image: ${imageUrl.substring(0, 80)}...`);
        } else {
          console.log(`  ⚠️  No image found, will use placeholder`);
        }
        
        // Be respectful with requests
        await sleep(1500);
      }
    } else if (articles.url) {
      // Handle single article (Highlighted_for_Pui_Sim)
      console.log(`  Processing: ${articles.title}`);
      const imageUrl = await fetchOGImage(articles.url);
      if (imageUrl) {
        articles.image = imageUrl;
        console.log(`  ✅ Found image: ${imageUrl.substring(0, 80)}...`);
      } else {
        console.log(`  ⚠️  No image found, will use placeholder`);
      }
    }
    
    console.log('');
  }
  
  // Save back to file with pretty formatting
  console.log('💾 Saving updated guidance_list.json...');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  
  console.log('🎉 Successfully updated guidance_list.json with images!');
  console.log('\nSummary:');
  
  // Print summary
  let totalArticles = 0;
  let articlesWithImages = 0;
  
  for (const [key, articles] of Object.entries(data)) {
    if (Array.isArray(articles)) {
      totalArticles += articles.length;
      articlesWithImages += articles.filter(a => a.image).length;
    } else if (articles.url) {
      totalArticles += 1;
      if (articles.image) articlesWithImages += 1;
    }
  }
  
  console.log(`📊 ${articlesWithImages}/${totalArticles} articles now have images`);
}

// Run the script
updateGuidanceList().catch(console.error);