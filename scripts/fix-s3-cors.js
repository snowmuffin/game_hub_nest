#!/usr/bin/env node
/**
 * Fix S3 CORS and file permissions for icons
 */

const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand, PutObjectAclCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const BUCKET_NAME = 'snowmuffin-game-assets';
const REGION = 'ap-northeast-2';

const s3Client = new S3Client({ region: REGION });

// CORS configuration
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: [
        'https://se.snowmuffingame.com',
        'https://snowmuffingame.com',
        'http://localhost:3000',
        'http://localhost:5173'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600
    }
  ]
};

async function checkCors() {
  try {
    console.log('🔍 Checking current CORS configuration...');
    const command = new GetBucketCorsCommand({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(command);
    console.log('✅ Current CORS:', JSON.stringify(response.CORSRules, null, 2));
  } catch (error) {
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('⚠️  No CORS configuration found');
    } else {
      console.error('❌ Error checking CORS:', error.message);
    }
  }
}

async function setCors() {
  try {
    console.log('🔧 Setting CORS configuration...');
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    });
    await s3Client.send(command);
    console.log('✅ CORS configuration updated successfully!');
    console.log(JSON.stringify(corsConfiguration, null, 2));
  } catch (error) {
    console.error('❌ Error setting CORS:', error.message);
    throw error;
  }
}

async function makeIconsPublic() {
  try {
    console.log('🔓 Making all icons public...');
    
    // List all objects in icons folder
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'icons/'
    });
    
    const response = await s3Client.send(listCommand);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('⚠️  No icons found');
      return;
    }
    
    console.log(`📝 Found ${response.Contents.length} files`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const obj of response.Contents) {
      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: obj.Key,
          ACL: 'public-read'
        });
        
        await s3Client.send(aclCommand);
        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`  ✅ Processed ${successCount}/${response.Contents.length} files...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to make ${obj.Key} public:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Made ${successCount} files public`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} files failed`);
    }
  } catch (error) {
    console.error('❌ Error making icons public:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Fixing S3 CORS and permissions...');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${REGION}\n`);
  
  try {
    // Check current CORS
    await checkCors();
    console.log();
    
    // Set CORS
    await setCors();
    console.log();
    
    // Make icons public
    await makeIconsPublic();
    console.log();
    
    console.log('✨ All done!');
  } catch (error) {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  }
}

main();
