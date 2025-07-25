#!/usr/bin/env python3
import json
import os

# Curated stock images from Unsplash for child development articles
child_development_images = [
    "https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=250&fit=crop&auto=format",  # Happy toddler
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=250&fit=crop&auto=format",  # Child playing
    "https://images.unsplash.com/photo-1607455925556-4c4e0ee874da?w=400&h=250&fit=crop&auto=format",  # Child learning
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=250&fit=crop&auto=format",  # Child reading
    "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=400&h=250&fit=crop&auto=format",  # Child with toys
    "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=250&fit=crop&auto=format",  # Child development
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&auto=format",  # Child milestone
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=250&fit=crop&auto=format",  # Happy child
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format",  # Child growth
    "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=250&fit=crop&auto=format",  # Child learning
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=250&fit=crop&auto=format",  # Preschooler
    "https://images.unsplash.com/photo-1595403021853-085b8638cb42?w=400&h=250&fit=crop&auto=format",  # Child activities
    "https://images.unsplash.com/photo-1594736797933-d0c29ac3de9b?w=400&h=250&fit=crop&auto=format",  # CDC style
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop&auto=format",  # Medical/health
    "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=250&fit=crop&auto=format",  # Parenting
    "https://images.unsplash.com/photo-1588772804025-4188460084c2?w=400&h=250&fit=crop&auto=format",  # Growth
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=format",  # Early childhood
    "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&h=250&fit=crop&auto=format",  # Health symptoms
    "https://images.unsplash.com/photo-1555558261-74a32c6ba6ca?w=400&h=250&fit=crop&auto=format",  # Child doctor
    "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=250&fit=crop&auto=format",  # Child development
    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=250&fit=crop&auto=format"   # Pediatric care
]

def add_curated_images():
    # Path to the JSON file
    json_path = '../frontend/src/assets/guidance_list.json'
    
    print('📖 Reading guidance_list.json...')
    
    # Read the JSON file
    with open(json_path, 'r') as file:
        data = json.load(file)
    
    print('🖼️  Adding curated images to all articles...\n')
    
    image_index = 0
    
    # Process each section
    for key, articles in data.items():
        print(f'Processing {key}:')
        
        if isinstance(articles, list):
            # Handle arrays of articles
            for i, article in enumerate(articles):
                if 'image' not in article or not article['image']:
                    article['image'] = child_development_images[image_index % len(child_development_images)]
                    print(f'  ✅ Added image to: {article["title"][:50]}...')
                    image_index += 1
                else:
                    print(f'  ⏭️  Skipped (already has image): {article["title"][:50]}...')
        
        elif isinstance(articles, dict) and 'url' in articles:
            # Handle single article (Highlighted_for_Pui_Sim)
            if 'image' not in articles or not articles['image']:
                articles['image'] = child_development_images[image_index % len(child_development_images)]
                print(f'  ✅ Added image to: {articles["title"][:50]}...')
                image_index += 1
            else:
                print(f'  ⏭️  Skipped (already has image): {articles["title"][:50]}...')
        
        print('')
    
    # Save back to file
    print('💾 Saving updated guidance_list.json...')
    with open(json_path, 'w') as file:
        json.dump(data, file, indent=2)
    
    print('🎉 Successfully updated guidance_list.json with curated images!')
    
    # Print summary
    total_articles = 0
    articles_with_images = 0
    
    for key, articles in data.items():
        if isinstance(articles, list):
            total_articles += len(articles)
            articles_with_images += sum(1 for a in articles if a.get('image'))
        elif isinstance(articles, dict) and 'url' in articles:
            total_articles += 1
            if articles.get('image'):
                articles_with_images += 1
    
    print(f'\n📊 {articles_with_images}/{total_articles} articles now have images')
    print(f'🖼️  Used {min(image_index, len(child_development_images))} unique images')

if __name__ == '__main__':
    add_curated_images()