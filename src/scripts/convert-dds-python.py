#!/usr/bin/env python3
"""
DDS to PNG converter using Pillow
Converts all DDS icons in the database to PNG format
"""

import os
import sys
import tempfile
from pathlib import Path
import boto3
from PIL import Image
import psycopg2
from psycopg2.extras import RealDictCursor

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
}

# S3 configuration
S3_BUCKET = os.getenv('S3_BUCKET_NAME', 'snowmuffin-game-assets')
S3_REGION = os.getenv('AWS_REGION', 'ap-northeast-2')

# Initialize S3 client
s3_client = boto3.client('s3', region_name=S3_REGION)

def download_from_s3(key: str, local_path: str) -> bool:
    """Download file from S3"""
    try:
        s3_client.download_file(S3_BUCKET, key, local_path)
        return True
    except Exception as e:
        print(f"  ❌ Download failed: {e}")
        return False

def upload_to_s3(local_path: str, key: str) -> str:
    """Upload file to S3 and return CDN URL"""
    try:
        s3_client.upload_file(
            local_path, 
            S3_BUCKET, 
            key,
            ExtraArgs={
                'ContentType': 'image/png',
                'ACL': 'public-read',  # Make file publicly accessible
                'CacheControl': 'public, max-age=31536000'
            }
        )
        return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}"
    except Exception as e:
        print(f"  ❌ Upload failed: {e}")
        return None

def convert_dds_to_png(dds_path: str, png_path: str) -> bool:
    """Convert DDS to PNG using Pillow"""
    try:
        # Open DDS file
        img = Image.open(dds_path)
        
        # Convert RGBA if needed
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA')
        
        # Save as PNG
        img.save(png_path, 'PNG', optimize=True)
        return True
    except Exception as e:
        print(f"  ❌ Conversion failed: {e}")
        return False

def update_database(icon_id: int, png_url: str) -> bool:
    """Update database with PNG URL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE space_engineers.icon_files SET png_cdn_url = %s WHERE id = %s",
            (png_url, icon_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"  ❌ Database update failed: {e}")
        return False

def get_icons_without_png():
    """Get all icons without PNG version"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT id, file_name as filename, cdn_url 
            FROM space_engineers.icon_files 
            WHERE png_cdn_url IS NULL 
            ORDER BY id
        """)
        
        icons = cur.fetchall()
        cur.close()
        conn.close()
        return icons
    except Exception as e:
        print(f"❌ Failed to fetch icons: {e}")
        return []

def main():
    print("🚀 Starting DDS to PNG conversion using Pillow...")
    print(f"📦 S3 Bucket: {S3_BUCKET}")
    print(f"🗄️  Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    print()
    
    # Get icons without PNG
    icons = get_icons_without_png()
    total = len(icons)
    
    if total == 0:
        print("✅ All icons already have PNG versions!")
        return
    
    print(f"📝 Found {total} icons to convert\n")
    
    success_count = 0
    failed_count = 0
    
    # Create temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        for idx, icon in enumerate(icons, 1):
            icon_id = icon['id']
            filename = icon['filename']
            cdn_url = icon['cdn_url']
            
            print(f"[{idx}/{total}] Processing: {filename}")
            
            # Skip if already PNG
            if filename.lower().endswith('.png'):
                print("  ⚠️  Already PNG, updating URL...")
                if update_database(icon_id, cdn_url):
                    success_count += 1
                    print("  ✅ Success!")
                else:
                    failed_count += 1
                continue
            
            # Skip if not DDS
            if not filename.lower().endswith('.dds'):
                print("  ⚠️  Not a DDS file, skipping...")
                failed_count += 1
                continue
            
            # Extract S3 key from URL
            s3_key = cdn_url.split(f"{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/")[1]
            
            # Temporary file paths
            dds_file = temp_path / f"icon_{icon_id}.dds"
            png_file = temp_path / f"icon_{icon_id}.png"
            
            try:
                # Download DDS from S3
                print("  📥 Downloading from S3...")
                if not download_from_s3(s3_key, str(dds_file)):
                    failed_count += 1
                    continue
                
                # Convert DDS to PNG
                print("  🔄 Converting DDS to PNG...")
                if not convert_dds_to_png(str(dds_file), str(png_file)):
                    failed_count += 1
                    dds_file.unlink(missing_ok=True)
                    continue
                
                # Get file sizes
                dds_size = dds_file.stat().st_size
                png_size = png_file.stat().st_size
                
                # Upload PNG to S3
                print("  📤 Uploading PNG to S3...")
                png_key = s3_key.replace('.dds', '.png')
                png_url = upload_to_s3(str(png_file), png_key)
                
                if not png_url:
                    failed_count += 1
                    dds_file.unlink(missing_ok=True)
                    png_file.unlink(missing_ok=True)
                    continue
                
                # Update database
                if update_database(icon_id, png_url):
                    success_count += 1
                    print(f"  ✅ Success! {dds_size} bytes → {png_size} bytes")
                else:
                    failed_count += 1
                
                # Cleanup temp files
                dds_file.unlink(missing_ok=True)
                png_file.unlink(missing_ok=True)
                
            except Exception as e:
                print(f"  ❌ Failed: {e}")
                failed_count += 1
                # Cleanup on error
                dds_file.unlink(missing_ok=True)
                png_file.unlink(missing_ok=True)
            
            print()
    
    # Print summary
    print("=" * 60)
    print("📊 Conversion Summary:")
    print(f"  ✅ Success: {success_count}")
    print(f"  ❌ Failed:  {failed_count}")
    print(f"  📝 Total:   {total}")
    print("=" * 60)
    print("✨ Done!")

if __name__ == '__main__':
    main()
