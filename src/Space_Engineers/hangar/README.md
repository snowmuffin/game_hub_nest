# Space Engineers Hangar Module

A simple grid hangar for Space Engineers that stores prefab/blueprint files in S3 and keeps metadata in Postgres.

## Env
- SE_HANGAR_S3_BUCKET: S3 bucket name
- SE_HANGAR_S3_REGION (optional, default ap-northeast-2)
- AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (or use instance profile/role)

## Endpoints (JWT required)
- POST /space-engineers/hangar/upload-url
  - body: { serverId?, name?, description?, contentType? }
  - resp: { id, uploadUrl, bucket, key }
- POST /space-engineers/hangar/confirm
  - body: { id, fileHash?, sizeBytes? }
- GET /space-engineers/hangar/list
- GET /space-engineers/hangar/:id/download-url
- DELETE /space-engineers/hangar/:id

## Notes
- Upload with the returned presigned URL (PUT). Then call confirm to mark AVAILABLE.
- Objects are not auto-deleted on soft delete; can be extended to purge S3.