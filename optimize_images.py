import os
from PIL import Image
from pathlib import Path

def convert_to_webp(directory):
    # Extensions to look for
    extensions = {'.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'}
    
    # Walk through directory
    count = 0
    saved_space = 0
    
    print(f"Scanning {directory} for images to optimize...")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = Path(root) / file
            
            if file_path.suffix in extensions:
                # Target path
                webp_path = file_path.with_suffix('.webp')
                
                # specific check to skip if webp already exists and is newer? 
                # User said "don't delete originals", so we just ensure we create the webp.
                
                try:
                    with Image.open(file_path) as img:
                        # Convert to RGB if necessary (e.g. for PNG with transparency)
                        # WebP supports transparency, so usually fine, but RGBA is best for PNG
                        
                        print(f"Converting: {file} -> {webp_path.name}")
                        
                        # Save as WebP
                        # quality=80 is a good balance
                        img.save(webp_path, 'WEBP', quality=80)
                        
                        # Stats
                        original_size = os.path.getsize(file_path)
                        new_size = os.path.getsize(webp_path)
                        
                        if new_size < original_size:
                            diff = original_size - new_size
                            saved_space += diff
                            print(f"  Saved: {diff/1024:.2f} KB ({(1 - new_size/original_size)*100:.1f}%)")
                        else:
                            print(f"  Warning: WebP larger than original (kept both)")
                            
                        count += 1
                        
                except Exception as e:
                    print(f"  Error converting {file}: {e}")

    print("-" * 30)
    print(f"Optimization Complete!")
    print(f"Images converted: {count}")
    print(f"Total space saved: {saved_space/1024/1024:.2f} MB")

if __name__ == "__main__":
    # Base directory to scan
    base_dir = Path("./public")
    if base_dir.exists():
        convert_to_webp(base_dir)
    else:
        print("Directory './public' not found.")
        # Fallback to current dir if needed or src/assets if public isn't the only place
        # But user context says typical Vite/React structure has public/assets.
        print("Checking ./src/assets...")
        src_assets = Path("./src/assets")
        if src_assets.exists():
            convert_to_webp(src_assets)
