const fs = require('fs');

// Curated stock images from Unsplash for child development articles
const childDevelopmentImages = [
  "https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=250&fit=crop&auto=format", // Happy toddler
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=250&fit=crop&auto=format", // Child playing
  "https://images.unsplash.com/photo-1607455925556-4c4e0ee874da?w=400&h=250&fit=crop&auto=format", // Child learning
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=250&fit=crop&auto=format", // Child reading
  "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=400&h=250&fit=crop&auto=format", // Child with toys
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=250&fit=crop&auto=format", // Child development
  "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&auto=format", // Child milestone
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=250&fit=crop&auto=format", // Happy child
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format", // Child growth
  "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=250&fit=crop&auto=format", // Child learning
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=250&fit=crop&auto=format", // Preschooler
  "https://images.unsplash.com/photo-1595403021853-085b8638cb42?w=400&h=250&fit=crop&auto=format", // Child activities
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=250&fit=crop&auto=format", // Child development
  "https://images.unsplash.com/photo-1594736797933-d0c29ac3de9b?w=400&h=250&fit=crop&auto=format", // CDC style
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop&auto=format", // Medical/health
  "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=250&fit=crop&auto=format", // Parenting
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=250&fit=crop&auto=format", // Development
  "https://images.unsplash.com/photo-1588772804025-4188460084c2?w=400&h=250&fit=crop&auto=format", // Growth
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=format", // Early childhood
  "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=250&fit=crop&auto=format", // Brain development
  "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&h=250&fit=crop&auto=format"  // Health symptoms
];

function addCuratedImages() {
  const jsonPath = '../frontend/src/assets/guidance_list.json';
  
  console.log('📖 Reading guidance_list.json...');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('🖼️  Adding curated images to all articles...\n');
  
  let imageIndex = 0;
  
  // Process each article array
  for (const [key, articles] of Object.entries(data)) {
    console.log(`Processing ${key}:`);
    
    if (Array.isArray(articles)) {
      // Handle arrays of articles
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        
        // Add image if it doesn't exist
        if (!article.image) {
          article.image = childDevelopmentImages[imageIndex % childDevelopmentImages.length];
          console.log(`  ✅ Added image to: ${article.title.substring(0, 50)}...`);
          imageIndex++;
        } else {
          console.log(`  ⏭️  Skipped (already has image): ${article.title.substring(0, 50)}...`);
        }
      }
    } else if (articles.url && !articles.image) {
      // Handle single article (Highlighted_for_Pui_Sim)
      articles.image = childDevelopmentImages[imageIndex % childDevelopmentImages.length];
      console.log(`  ✅ Added image to: ${articles.title.substring(0, 50)}...`);
      imageIndex++;
    }
    
    console.log('');
  }
  
  // Save back to file with pretty formatting
  console.log('💾 Saving updated guidance_list.json...');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  
  console.log('🎉 Successfully updated guidance_list.json with curated images!');
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
  console.log(`🖼️  Used ${Math.min(imageIndex, childDevelopmentImages.length)} unique images`);
}

// Run the script
addCuratedImages();