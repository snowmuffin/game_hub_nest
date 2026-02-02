# Game Server API Migration Guide
## Inventory Upload/Download API Changes

This document outlines the changes required in the Space Engineers game server to work with the updated inventory API.

---

## 🔑 1. API Key Authentication (REQUIRED)

All inventory API endpoints now require API key authentication.

### Add Header to All Requests

```csharp
// C# Example
var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", Config.SE_INGEST_API_KEY);
```

### Affected Endpoints
- `POST /space-engineers/item/upload`
- `POST /space-engineers/item/download`
- `POST /space-engineers/item/download/confirm`

### Configuration
Add to your game server configuration file:
```ini
SE_INGEST_API_KEY=your-secure-api-key-here
```

---

## 📝 2. Upload Request Body Changes

### BEFORE (Old)
```json
{
  "userId": 12345,
  "itemName": "MyObjectBuilder_Ore/Iron",
  "quantity": 100
}
```

### AFTER (New)
```json
{
  "steamId": "76561198012345678",
  "itemName": "MyObjectBuilder_Ore/Iron",
  "quantity": 100
}
```

### Code Changes Required
```csharp
// OLD CODE
var request = new {
    userId = player.UserId,  // ❌ Remove this
    itemName = item.IndexName,
    quantity = item.Quantity
};

// NEW CODE
var request = new {
    steamId = player.SteamId.ToString(),  // ✅ Use SteamID instead
    itemName = item.IndexName,
    quantity = item.Quantity
};
```

---

## 🔢 3. Quantity Validation

### New Limits
- **Minimum**: 1
- **Maximum**: 1,000,000

### Server-Side Validation (Recommended)
Add validation before making API calls:

```csharp
public bool ValidateQuantity(int quantity)
{
    if (quantity <= 0)
    {
        Log.Error($"Invalid quantity: {quantity}. Must be greater than 0.");
        return false;
    }
    
    if (quantity > 1000000)
    {
        Log.Error($"Invalid quantity: {quantity}. Cannot exceed 1,000,000.");
        return false;
    }
    
    return true;
}

// Usage
if (!ValidateQuantity(request.quantity))
{
    // Show error to player or handle gracefully
    return;
}
```

---

## ⚠️ 4. Error Handling Updates

### New HTTP Status Codes

| Status Code | Meaning | Action Required |
|-------------|---------|-----------------|
| **200** | Success | Continue normal flow |
| **400 Bad Request** | Invalid quantity, missing fields | Fix input data, don't retry |
| **401 Unauthorized** | Missing/invalid API key | Check API key configuration |
| **404 Not Found** | User/item/pending request not found | Verify data exists, check logs |
| **500 Server Error** | Server-side error | Log and retry with backoff |

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Quantity must be greater than 0.",
  "error": "Bad Request"
}
```

### Example Error Handling Code

```csharp
public async Task<bool> HandleApiResponse(HttpResponseMessage response)
{
    if (response.IsSuccessStatusCode)
    {
        return true;
    }

    var errorBody = await response.Content.ReadAsStringAsync();
    
    switch ((int)response.StatusCode)
    {
        case 400:
            // Bad request - validation error
            Log.Error($"Validation error: {errorBody}");
            Log.Error("This usually means quantity is invalid or required fields are missing.");
            // Do NOT retry - fix the input data
            return false;
            
        case 401:
            // Unauthorized - API key issue
            Log.Error("API key is missing or invalid. Check SE_INGEST_API_KEY configuration.");
            // Do NOT retry - fix configuration
            return false;
            
        case 404:
            // Not found - resource doesn't exist
            Log.Error($"Resource not found: {errorBody}");
            Log.Error("User, item, or pending download request doesn't exist.");
            // Do NOT retry - check if resource exists
            return false;
            
        case 500:
        case 502:
        case 503:
            // Server error - may be temporary
            Log.Warn($"Server error: {errorBody}");
            // CAN retry with exponential backoff
            return false;
            
        default:
            Log.Error($"Unexpected status code {response.StatusCode}: {errorBody}");
            return false;
    }
}
```

---

## 🔄 5. Download Confirm Changes

### Important: Exact Quantity Matching

The confirm endpoint now requires **exact quantity matching** with the pending request.

```csharp
// Example: If you requested 100 items in download
POST /space-engineers/item/download
{
  "steamid": "76561198012345678",
  "index_name": "MyObjectBuilder_Ore/Iron",
  "quantity": 100  // Creates PENDING log for 100 items
}

// You MUST confirm with the SAME quantity
POST /space-engineers/item/download/confirm
{
  "steamid": "76561198012345678",
  "index_name": "MyObjectBuilder_Ore/Iron",
  "quantity": 100  // ✅ Must match the PENDING request
}

// This will FAIL with 404 Not Found
{
  "quantity": 50  // ❌ Different quantity - no matching PENDING request
}
```

### Error When No Matching Pending Request
```json
{
  "statusCode": 404,
  "message": "No pending download request found for 50x 'MyObjectBuilder_Ore/Iron'.",
  "error": "Not Found"
}
```

### Recommended Flow
```csharp
// Store the requested quantity
var requestedQuantity = 100;
var downloadRequest = new {
    steamid = player.SteamId.ToString(),
    index_name = "MyObjectBuilder_Ore/Iron",
    quantity = requestedQuantity
};

// Make download request
var response = await client.PostAsync("/space-engineers/item/download", ...);

if (response.IsSuccessStatusCode)
{
    // Wait for player to receive items in-game
    // ...
    
    // Confirm with EXACT same quantity
    var confirmRequest = new {
        steamid = player.SteamId.ToString(),
        index_name = "MyObjectBuilder_Ore/Iron",
        quantity = requestedQuantity  // Use the stored quantity
    };
    
    await client.PostAsync("/space-engineers/item/download/confirm", ...);
}
```

---

## 🧪 6. Testing Checklist

Before deploying to production:

- [ ] API key is configured correctly
- [ ] Upload requests use `steamId` instead of `userId`
- [ ] All API calls include `x-api-key` header
- [ ] Quantity validation is implemented (1 to 1,000,000)
- [ ] Error handling covers all status codes (400, 401, 404, 500)
- [ ] Download confirm uses exact matching quantity
- [ ] Test with invalid quantities (0, -1, 1000001)
- [ ] Test with missing/invalid API key
- [ ] Test with non-existent items/users

---

## 📋 7. Summary of Changes

| Change | Impact | Required Action |
|--------|--------|-----------------|
| API key authentication | **BREAKING** | Add header to all requests |
| Upload body: `userId` → `steamId` | **BREAKING** | Update request structure |
| Quantity validation (1-1M) | **BREAKING** | Add validation, handle 400 errors |
| Transaction safety | Enhancement | No action needed |
| Exact quantity matching | **BREAKING** | Store request quantity for confirm |
| Better error messages | Enhancement | Update error handling logic |

---

## 🆘 8. Troubleshooting

### "401 Unauthorized"
- **Cause**: API key missing or invalid
- **Solution**: Check `SE_INGEST_API_KEY` configuration and header

### "400 Bad Request: Quantity must be greater than 0"
- **Cause**: Quantity is 0 or negative
- **Solution**: Add validation before API call

### "400 Bad Request: Quantity cannot exceed 1,000,000"
- **Cause**: Quantity too large
- **Solution**: Split into multiple smaller requests

### "404 Not Found: No pending download request"
- **Cause**: Confirm quantity doesn't match download request
- **Solution**: Use exact same quantity for both download and confirm

### "404 Not Found: Item not found in storage"
- **Cause**: Player doesn't have this item in storage
- **Solution**: Check item exists before download request

---

## 📞 Support

If you encounter issues after migration:
1. Check server logs for detailed error messages
2. Verify API key configuration
3. Test with Postman/curl to isolate game server vs API issues
4. Contact backend team with error details and request payload
