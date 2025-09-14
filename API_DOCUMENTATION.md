# Space Engineers Admin API Documentation

Detailed description and request/response formats for all Space Engineers Admin API endpoints.

## Basic Information

- **Base URL**: `http://localhost:3000`
- **Authentication**: Bearer JWT Token
- **Required Role**: GAME_ADMIN or higher
- **Content-Type**: `application/json`

## Authentication Header

All requests require an Authorization header with a JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 1. Get Space Engineers User List

Retrieves the complete user list, including Space Engineers storage information.

### Request

**Method**: `GET`  
**URL**: `/admin/space-engineers/users`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 50 | Results per page (maximum 100) |

#### Example Request

```bash
curl -X GET \
  'http://localhost:3000/admin/space-engineers/users?page=1&limit=20' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

#### Success (200 OK)

```json
{
  "users": [
    {
      "id": 1,
      "username": "player123",
      "steamId": "76561198123456789",
      "email": "player123@example.com",
      "score": 1250.5,
      "roles": ["USER"],
      "lastActiveAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "hasSpaceEngineersStorage": true,
      "storageItemCount": 42
    },
    {
      "id": 2,
      "username": "builder_pro",
      "steamId": "76561198987654321",
      "email": "builder@example.com",
      "score": 890.0,
      "roles": ["USER", "PREMIUM"],
      "lastActiveAt": "2025-01-14T15:22:30.000Z",
      "createdAt": "2025-01-05T12:00:00.000Z",
      "hasSpaceEngineersStorage": false,
      "storageItemCount": 0
    }
  ],
  "totalUsers": 150,
  "spaceEngineersUsers": 85
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. GAME_ADMIN role or higher required.",
  "error": "Forbidden"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 👤 2. Get User Inventory (User ID)

Retrieves a specific user's Space Engineers inventory by User ID.

### Request

**Method**: `GET`  
**URL**: `/admin/space-engineers/users/{userId}/inventory`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | Yes | ID of the user to query |

#### Example Request

```bash
curl -X GET \
  'http://localhost:3000/admin/space-engineers/users/123/inventory' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

#### Success (200 OK)

```json
{
  "user": {
    "id": 123,
    "username": "player123",
    "steamId": "76561198123456789",
    "email": "player123@example.com",
    "score": 1250.5,
    "roles": ["USER"],
    "lastActiveAt": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
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
        "description": "Basic construction material made from steel ingots",
        "icons": {
          "large": "SteelPlate_Large.png",
          "small": "SteelPlate_Small.png"
        }
      },
      {
        "id": 2,
        "displayName": "Iron Ore",
        "indexName": "MyObjectBuilder_Ore/Iron",
        "category": "Ore",
        "rarity": 1,
        "quantity": 300,
        "description": "Raw iron ore suitable for refining into iron ingots",
        "icons": {
          "large": "IronOre_Large.png",
          "small": "IronOre_Small.png"
        }
      },
      {
        "id": 15,
        "displayName": "Uranium Ore",
        "indexName": "MyObjectBuilder_Ore/Uranium",
        "category": "Ore",
        "rarity": 5,
        "quantity": 25,
        "description": "Rare radioactive ore used for nuclear reactors",
        "icons": {
          "large": "UraniumOre_Large.png",
          "small": "UraniumOre_Small.png"
        }
      }
    ]
  }
}
```

#### When Storage doesn't exist

```json
{
  "user": {
    "id": 123,
    "username": "new_player",
    "steamId": "76561198999888777",
    "email": "newplayer@example.com",
    "score": 0,
    "roles": ["USER"],
    "lastActiveAt": "2025-01-15T09:00:00.000Z",
    "createdAt": "2025-01-15T09:00:00.000Z"
  },
  "storage": null
}
```

#### Error Responses

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

---

## 🎮 3. Get User Inventory (Steam ID)

Retrieves a specific user's Space Engineers inventory by Steam ID.

### Request

**Method**: `GET`  
**URL**: `/admin/space-engineers/steam/{steamId}/inventory`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `steamId` | string | Yes | Steam ID of the user to query |

#### Example Request

```bash
curl -X GET \
  'http://localhost:3000/admin/space-engineers/steam/76561198123456789/inventory' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

#### Success (200 OK)

Response format is identical to User ID query. [See response example above](#success-200-ok-1)

#### Error Responses

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "User with Steam ID 76561198999999999 not found",
  "error": "Not Found"
}
```

---

## 🔍 4. Search Users

Search users by username.

### Request

**Method**: `GET`  
**URL**: `/admin/users/search`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | Username to search (partial match) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 20) |

#### Example Request

```bash
curl -X GET \
  'http://localhost:3000/admin/users/search?username=player&page=1&limit=10' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

#### Success (200 OK)

```json
{
  "users": [
    {
      "id": 1,
      "username": "player123",
      "steamId": "76561198123456789",
      "email": "player123@example.com",
      "score": 1250.5,
      "roles": ["USER"],
      "lastActiveAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "hasSpaceEngineersStorage": true,
      "storageItemCount": 42
    },
    {
      "id": 25,
      "username": "pro_player",
      "steamId": "76561198555444333",
      "email": "proplayer@example.com",
      "score": 2100.75,
      "roles": ["USER", "PREMIUM"],
      "lastActiveAt": "2025-01-15T08:15:00.000Z",
      "createdAt": "2024-12-20T14:30:00.000Z",
      "hasSpaceEngineersStorage": true,
      "storageItemCount": 156
    }
  ],
  "totalUsers": 15,
  "spaceEngineersUsers": 12
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Username parameter is required",
  "error": "Bad Request"
}
```

---

## 🔐 Permissions and Roles

### Required Roles

All Admin API endpoints require one or more of the following roles:

- `GAME_ADMIN`
- `SERVER_ADMIN`
- `PLATFORM_ADMIN`
- `SUPER_ADMIN`

### How to Check Role

To check the current user's role:

```bash
curl -X GET \
  'http://localhost:3000/auth/profile' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 📝 Common Response Format

### Success Response

All successful responses return JSON format data with HTTP 200 status code.

### Error Response

Error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error Type"
}
```

#### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication token missing or invalid |
| 403 | Forbidden | Insufficient permissions (GAME_ADMIN role required) |
| 404 | Not Found | Requested resource not found |
| 500 | Internal Server Error | Internal server error |

---

## 💡 Usage Examples

### JavaScript/TypeScript 예시

```typescript
class SpaceEngineersAdminAPI {
  private baseURL = 'http://localhost:3000';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 유저 목록 조회
  async getUsers(page = 1, limit = 50) {
    return this.request(`/admin/space-engineers/users?page=${page}&limit=${limit}`);
  }

  // 유저 인벤토리 조회
  async getUserInventory(userId: number) {
    return this.request(`/admin/space-engineers/users/${userId}/inventory`);
  }

  // Steam ID로 유저 조회
  async getUserBySteamId(steamId: string) {
    return this.request(`/admin/space-engineers/steam/${steamId}/inventory`);
  }

  // 유저 검색
  async searchUsers(username: string, page = 1, limit = 20) {
    return this.request(`/admin/users/search?username=${encodeURIComponent(username)}&page=${page}&limit=${limit}`);
  }
}

// 사용 예시
const adminAPI = new SpaceEngineersAdminAPI('your-jwt-token');

try {
  // 첫 페이지 유저 20명 조회
  const users = await adminAPI.getUsers(1, 20);
  console.log(`총 ${users.totalUsers}명 중 ${users.spaceEngineersUsers}명이 Space Engineers 플레이 중`);

  // 특정 유저 인벤토리 조회
  const inventory = await adminAPI.getUserInventory(123);
  if (inventory.storage) {
    console.log(`${inventory.user.username}님의 인벤토리: ${inventory.storage.totalItems}개 아이템`);
  }
} catch (error) {
  console.error('API 호출 실패:', error);
}
```

### Python 예시

```python
import requests
import json

class SpaceEngineersAdminAPI:
    def __init__(self, token, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def _request(self, endpoint):
        response = requests.get(f'{self.base_url}{endpoint}', headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_users(self, page=1, limit=50):
        return self._request(f'/admin/space-engineers/users?page={page}&limit={limit}')
    
    def get_user_inventory(self, user_id):
        return self._request(f'/admin/space-engineers/users/{user_id}/inventory')
    
    def get_user_by_steam_id(self, steam_id):
        return self._request(f'/admin/space-engineers/steam/{steam_id}/inventory')
    
    def search_users(self, username, page=1, limit=20):
        return self._request(f'/admin/users/search?username={username}&page={page}&limit={limit}')

# 사용 예시
admin_api = SpaceEngineersAdminAPI('your-jwt-token')

try:
    # 유저 목록 조회
    users = admin_api.get_users(page=1, limit=20)
    print(f"{users['spaceEngineersUsers']} out of {users['totalUsers']} users are playing Space Engineers")
    
except requests.exceptions.RequestException as e:
    print(f"API 호출 실패: {e}")
```

---

## 📚 관련 문서

- [User Role System](./USER_ROLE_SYSTEM.md) - 역할 기반 접근 제어 시스템
- [Admin Space Engineers Guide](./ADMIN_SPACE_ENGINEERS_GUIDE.md) - 관리자 가이드
