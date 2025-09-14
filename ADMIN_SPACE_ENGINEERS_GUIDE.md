# Admin Space Engineers User Management

API system that allows administrators to manage Space Engineers users' accounts and inventories.

## Permission Requirements

All Admin APIs require **GAME_ADMIN** role or higher.

## API Endpoints

### 1. Get Space Engineers User List

**GET** `/admin/space-engineers/users`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/admin/space-engineers/users?page=1&limit=20"
```

Response:
```json
{
  "users": [
    {
      "id": 1,
      "username": "player1",
      "steamId": "76561198123456789",
      "email": "player1@example.com",
      "score": 1250.5,
      "roles": ["USER"],
      "lastActiveAt": "2025-01-15T10:30:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "hasSpaceEngineersStorage": true,
      "storageItemCount": 42
    }
  ],
  "totalUsers": 150,
  "spaceEngineersUsers": 85
}
```

### 2. Get Specific User Inventory (User ID)

**GET** `/admin/space-engineers/users/:userId/inventory`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/admin/space-engineers/users/123/inventory"
```

### 3. Get Specific User Inventory (Steam ID)

**GET** `/admin/space-engineers/steam/:steamId/inventory`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/admin/space-engineers/steam/76561198123456789/inventory"
```

Response:
```json
{
  "user": {
    "id": 123,
    "username": "player1",
    "steamId": "76561198123456789",
    "email": "player1@example.com",
    "score": 1250.5,
    "roles": ["USER"],
    "lastActiveAt": "2025-01-15T10:30:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "storage": {
    "id": 45,
    "totalItems": 1250,
    "uniqueItems": 15,
    "items": [
      {
        "id": 1,
        "displayName": "Steel Plate",
        "indexName": "MyObjectBuilder_Component/SteelPlate",
        "category": "Component",
        "rarity": 1,
        "quantity": 500,
        "description": "Basic construction material",
        "icons": {...}
      },
      {
        "id": 2,
        "displayName": "Iron Ore",
        "indexName": "MyObjectBuilder_Ore/Iron",
        "category": "Ore",
        "rarity": 1,
        "quantity": 300,
        "description": "Raw iron ore for processing",
        "icons": {...}
      }
    ]
  }
}
```

### 4. Search Users by Username

**GET** `/admin/users/search`

Query Parameters:
- `username` (required): Username to search for
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/admin/users/search?username=player&page=1&limit=10"
```

## Usage Scenarios

### 1. Get All Space Engineers Players

```typescript
// Get page 1, 50 users per page
const response = await fetch('/admin/space-engineers/users?page=1&limit=50', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

console.log(`${data.spaceEngineersUsers} out of ${data.totalUsers} users are playing Space Engineers`);
```

### 2. Check Specific Player's Inventory

```typescript
// Query by Steam ID
const steamId = '76561198123456789';
const response = await fetch(`/admin/space-engineers/steam/${steamId}/inventory`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

if (data.storage) {
  console.log(`${data.user.username}'s inventory:`);
  console.log(`Total items: ${data.storage.totalItems}`);
  console.log(`Unique items: ${data.storage.uniqueItems} types`);
  
  // Top 5 most owned items
  const topItems = data.storage.items.slice(0, 5);
  topItems.forEach(item => {
    console.log(`- ${item.displayName}: ${item.quantity} units`);
  });
} else {
  console.log(`${data.user.username} doesn't have Space Engineers storage yet.`);
}
```

### 3. Search Players

```typescript
// Search by username
const username = 'player';
const response = await fetch(`/admin/users/search?username=${username}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

console.log(`Search results for '${username}': ${data.users.length} users`);
data.users.forEach(user => {
  console.log(`- ${user.username} (Steam: ${user.steamId}) - Items: ${user.storageItemCount}`);
});
```

## Permission Check

Before using the API, verify that the user has appropriate permissions:

```typescript
// Check current user info
const userResponse = await fetch('/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await userResponse.json();

const hasAdminAccess = user.roles.includes('GAME_ADMIN') || 
                     user.roles.includes('SERVER_ADMIN') || 
                     user.roles.includes('PLATFORM_ADMIN') || 
                     user.roles.includes('SUPER_ADMIN');

if (hasAdminAccess) {
  console.log('You have admin privileges. Admin API access available.');
} else {
  console.log('Admin privileges required.');
}
```

## Error Handling

```typescript
try {
  const response = await fetch('/admin/space-engineers/users');
  
  if (response.status === 403) {
    console.error('Insufficient permissions. GAME_ADMIN role required.');
  } else if (response.status === 404) {
    console.error('Requested resource not found.');
  } else if (!response.ok) {
    console.error('API request failed:', response.statusText);
  } else {
    const data = await response.json();
    // Handle successful response
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Important Notes

1. **Permission Requirements**: All Admin APIs require GAME_ADMIN role or higher.
2. **Rate Limiting**: Use pagination for bulk queries to reduce server load.
3. **Privacy Protection**: Use user information only for administrative purposes and protect it appropriately.
4. **Logging**: All administrative actions are logged.
