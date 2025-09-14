## Admin Verify Access API

Endpoint: GET /admin/verify-access

Auth: Requires a valid JWT (Bearer token). The route is protected by JwtAuthGuard and RolesGuard. If the user is not an admin, the endpoint returns HTTP 403.

Success Response (200):
{
	"isAdmin": true,
	"adminData": {
		"steamId": "76561198000000000",
		"username": "adminUser",
		"isAdmin": true,
		"adminLevel": 1,
		"lastAdminAccess": "2025-01-01T12:34:56.000Z"
	},
	"sessionExpiry": "2025-01-01T13:04:56.000Z"
}

Failure Response (403):
{
	"statusCode": 403,
	"message": "Administrator privileges required",
	"error": "Forbidden"
}

Notes:
- adminLevel mapping: 2 for SUPER_ADMIN; 1 for GAME_ADMIN, SERVER_ADMIN, or PLATFORM_ADMIN.
- sessionExpiry is 30 minutes from the verification time (ISO 8601 string).
- lastAdminAccess is the verification time (ISO 8601 string).

