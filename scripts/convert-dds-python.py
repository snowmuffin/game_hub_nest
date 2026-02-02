#!/usr/bin/env python3
"""
DDS to PNG converter using Pillow library
Converts all DDS icons in the database to PNG format
"""

import sys
import os
import subprocess
import json
from pathlib import Path

# Add parent directory to path to import database modules
sys.path.insert(0, str(Path(__file__).parent.parent))

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import PIL
        from PIL import Image
        print(f"✅ Pillow {PIL.__version__} is installed")
        return True
    except ImportError:
        print("❌ Pillow is not installed")
        print("Installing Pillow...")
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow"], check=True)
        return True

def get_icons_without_png():
    """Get list of icons that don't have PNG versions"""
    # Use psql to query database
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '55432')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'password')
    db_name = os.environ.get('DB_NAME', 'snowmuffin')
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    query = """
    SELECT id, file_name, cdn_url 
    FROM space_engineers.icon_files 
    WHERE png_cdn_url IS NULL 
    ORDER BY id;
    """
    
    result = subprocess.run(
        ['psql', connection_string, '-t', '-A', '-F,', '-c', query],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"❌ Database query failed: {result.stderr}")
        return []
    
    icons = []
    for line in result.stdout.strip().split('\n'):
        if line:
            parts = line.split(',')
            if len(parts) == 3:
                icons.append({
                    'id': int(parts[0]),
                    'file_name': parts[1],
                    'cdn_url': parts[2]
                })
    
    return icons

def download_from_s3(cdn_url, local_path):
    """Download file from S3 using AWS CLI"""
    # Extract S3 path from CDN URL
    # CDN URL format: https://snowmuffin-game-assets.s3.ap-northeast-2.amazonaws.com/icons/...
    s3_key = cdn_url.split('.com/')[-1]
    s3_path = f"s3://snowmuffin-game-assets/{s3_key}"
    
    result = subprocess.run(
        ['aws', 's3', 'cp', s3_path, local_path],
        capture_output=True,
        text=True
    )
    
    return result.returncode == 0

def upload_to_s3(local_path, s3_key):
    """Upload file to S3 using AWS CLI"""
    s3_path = f"s3://snowmuffin-game-assets/{s3_key}"
    
    result = subprocess.run(
        ['aws', 's3', 'cp', local_path, s3_path, '--content-type', 'image/png'],
        capture_output=True,
        text=True
    )
    
    return result.returncode == 0

def convert_dds_to_png(dds_path, png_path):
    """Convert DDS to PNG using Pillow"""
    try:
        from PIL import Image
        
        # Open DDS file
        img = Image.open(dds_path)
        
        # Convert to RGB if needed (remove alpha channel for simpler processing)
        if img.mode in ('RGBA', 'LA'):
            # Keep alpha channel
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')
        
        # Save as PNG
        img.save(png_path, 'PNG', optimize=True)
        
        return True
    except Exception as e:
        print(f"  ❌ Conversion error: {e}")
        return False

def update_database(icon_id, png_cdn_url):
    """Update database with PNG CDN URL"""
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '55432')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'password')
    db_name = os.environ.get('DB_NAME', 'snowmuffin')
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    query = f"UPDATE space_engineers.icon_files SET png_cdn_url = '{png_cdn_url}' WHERE id = {icon_id};"
    
    result = subprocess.run(
        ['psql', connection_string, '-c', query],
        capture_output=True,
        text=True
    )
    
    return result.returncode == 0

def main():
    print("🚀 Starting DDS to PNG conversion with Python/Pillow\n")
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Get icons without PNG
    print("📋 Fetching icons without PNG versions...")
    icons = get_icons_without_png()
    
    if not icons:
        print("✅ All icons already have PNG versions!")
        return
    
    print(f"📦 Found {len(icons)} icons to convert\n")
    
    # Create temp directory
    temp_dir = Path('/tmp/icon_conversion')
    temp_dir.mkdir(exist_ok=True)
    
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    for idx, icon in enumerate(icons, 1):
        print(f"[{idx}/{len(icons)}] Processing: {icon['file_name']}")
        
        dds_path = temp_dir / f"temp_{icon['id']}.dds"
        png_path = temp_dir / f"temp_{icon['id']}.png"
        
        try:
            # Download DDS from S3
            print(f"  📥 Downloading from S3...")
            if not download_from_s3(icon['cdn_url'], str(dds_path)):
                print(f"  ❌ Failed to download from S3")
                failed_count += 1
                continue
            
            # Convert DDS to PNG
            print(f"  🔄 Converting DDS to PNG...")
            if not convert_dds_to_png(str(dds_path), str(png_path)):
                failed_count += 1
                dds_path.unlink(missing_ok=True)
                continue
            
            # Check PNG file size
            png_size = png_path.stat().st_size
            dds_size = dds_path.stat().st_size
            
            # Upload PNG to S3
            print(f"  📤 Uploading PNG to S3...")
            png_file_name = icon['file_name'].replace('.dds', '.png')
            s3_key = f"icons/{png_file_name}"
            
            if not upload_to_s3(str(png_path), s3_key):
                print(f"  ❌ Failed to upload to S3")
                failed_count += 1
                dds_path.unlink(missing_ok=True)
                png_path.unlink(missing_ok=True)
                continue
            
            # Update database
            png_cdn_url = f"https://snowmuffin-game-assets.s3.ap-northeast-2.amazonaws.com/{s3_key}"
            if not update_database(icon['id'], png_cdn_url):
                print(f"  ⚠️ Failed to update database, but PNG is uploaded")
            
            print(f"  ✅ Success! {dds_size} bytes → {png_size} bytes\n")
            success_count += 1
            
            # Cleanup
            dds_path.unlink(missing_ok=True)
            png_path.unlink(missing_ok=True)
            
        except Exception as e:
            print(f"  ❌ Failed: {e}\n")
            failed_count += 1
            dds_path.unlink(missing_ok=True)
            png_path.unlink(missing_ok=True)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 Conversion Summary:")
    print(f"  ✅ Success: {success_count}")
    print(f"  ❌ Failed:  {failed_count}")
    print(f"  ⚠️  Skipped: {skipped_count}")
    print(f"  📝 Total:   {len(icons)}")
    print("="*60)
    print("✨ Done!")

if __name__ == '__main__':
    main()
