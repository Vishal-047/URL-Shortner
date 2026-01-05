# URL Shortener Application Workflow

This document explains the complete workflow of the URL Shortener application, detailing how requests flow through the system.

## Application Architecture

```
Client Request
    ↓
Express Server (index.js)
    ↓
Routes (routes/url.js)
    ↓
Controller (controller/url.js)
    ↓
Model (model/url.js)
    ↓
MongoDB Database
```

## Workflow Overview

### 1. Application Initialization

**File: `index.js`**

1. Express server is initialized
2. Middleware is configured:
   - `express.json()` for parsing JSON request bodies
3. Routes are registered:
   - `/url` routes are handled by `routes/url.js`
4. Server starts listening on port 8001
5. MongoDB connection is established:
   - Connects to `mongodb://127.0.0.1:27017/short-url`
   - Database name: `short-url`

### 2. Create Short URL Workflow

**Endpoint: `POST /url`**

```
Step 1: Client sends POST request
   POST http://localhost:8001/url
   Body: { "url": "https://example.com/long-url" }
        ↓
Step 2: Request routed to routes/url.js
   Router matches POST '/' route
        ↓
Step 3: Controller handles request (controller/url.js)
   - Validates request body
   - Checks if 'url' field exists
   - If missing: Returns 400 error
        ↓
Step 4: Generate Short ID
   - Uses nanoid(8) to generate unique 8-character ID
   - Example: "abc12345"
        ↓
Step 5: Save to Database
   - Creates new URL document in MongoDB
   - Fields saved:
     * shortId: Generated unique ID
     * redirectedURL: Original URL from request
     * visitHistory: Empty array (initialized)
     * TotalClicks: 0 (default)
     * createdAt: Auto-generated timestamp
     * updatedAt: Auto-generated timestamp
        ↓
Step 6: Return Response
   {
     "id": "abc12345",
     "Shorten_URL": "http://localhost:8001/abc12345"
   }
```

### 3. Redirect to Original URL Workflow

**Endpoint: `GET /:shortId`**

```
Step 1: Client accesses short URL
   GET http://localhost:8001/abc12345
        ↓
Step 2: Express matches dynamic route (index.js)
   - Extracts shortId from URL params
   - Example: shortId = "abc12345"
        ↓
Step 3: Database Query & Update
   - Finds URL document by shortId
   - Atomically updates:
     * Increments TotalClicks by 1
     * Pushes new visit entry to visitHistory array
       {
         timestamp: Date.now()
       }
        ↓
Step 4: Check if URL exists
   - If not found: Returns 404 error
   - If found: Proceeds to redirect
        ↓
Step 5: Redirect Response
   - HTTP 302 redirect to original URL
   - Browser automatically follows redirect
```

### 4. Analytics Workflow

**Endpoint: `GET /url/analytics/:shortId`**

```
Step 1: Client requests analytics
   GET http://localhost:8001/url/analytics/abc12345
        ↓
Step 2: Request routed to routes/url.js
   Router matches GET '/analytics/:shortId' route
        ↓
Step 3: Controller handles request (controller/url.js)
   - Extracts shortId from URL params
        ↓
Step 4: Database Query
   - Finds URL document by shortId
   - Retrieves visitHistory array
        ↓
Step 5: Calculate Statistics
   - totalClicks: Length of visitHistory array
   - analytics: Complete visitHistory array with timestamps
        ↓
Step 6: Return Response
   {
     "totalClicks": 10,
     "analytics": [
       { "timestamp": 1234567890 },
       { "timestamp": 1234567900 },
       ...
     ]
   }
```

## Data Flow Diagram

### Creating a Short URL
```
[Client] 
  POST /url {"url": "https://example.com"}
    ↓
[Express Router] 
  routes/url.js → POST '/'
    ↓
[Controller] 
  controller/url.js → handleURL()
    ↓
[Validation] 
  Check if url exists
    ↓
[Generate ID] 
  nanoid(8) → "abc12345"
    ↓
[Database] 
  URL.create({shortId, redirectedURL, visitHistory: []})
    ↓
[Response] 
  {"id": "abc12345", "Shorten_URL": "http://localhost:8001/abc12345"}
```

### Accessing Short URL
```
[Client] 
  GET /abc12345
    ↓
[Express] 
  index.js → GET '/:shortId'
    ↓
[Database Query] 
  URL.findOneAndUpdate({shortId}, {
    $inc: {TotalClicks: 1},
    $push: {visitHistory: {timestamp: Date.now()}}
  })
    ↓
[Check Result] 
  If found → redirect(redirectedURL)
  If not found → 404 error
    ↓
[Browser] 
  Automatically redirects to original URL
```

### Getting Analytics
```
[Client] 
  GET /url/analytics/abc12345
    ↓
[Express Router] 
  routes/url.js → GET '/analytics/:shortId'
    ↓
[Controller] 
  controller/url.js → analytics()
    ↓
[Database Query] 
  URL.findOne({shortId})
    ↓
[Process Data] 
  Calculate totalClicks from visitHistory.length
    ↓
[Response] 
  {"totalClicks": 10, "analytics": [...]}
```

## Database Schema

**Collection: `urls`**

```javascript
{
  shortId: String (required, unique),
  redirectedURL: String (required),
  TotalClicks: Number (default: 0),
  visitHistory: [
    {
      timestamp: Number
    }
  ],
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Key Components

### 1. **Short ID Generation**
- Uses `nanoid` library
- Generates 8-character unique identifiers
- URL-safe characters
- Collision-resistant

### 2. **Click Tracking**
- Increments `TotalClicks` counter
- Records each visit with timestamp in `visitHistory`
- Uses MongoDB atomic operations (`$inc`, `$push`)

### 3. **Error Handling**
- 400 Bad Request: Missing URL in request body
- 404 Not Found: Short URL doesn't exist

## Request/Response Examples

### Create Short URL
**Request:**
```http
POST /url HTTP/1.1
Content-Type: application/json

{
  "url": "https://www.google.com/search?q=nodejs"
}
```

**Response:**
```json
{
  "id": "xYz9aBc2",
  "Shorten_URL": "http://localhost:8001/xYz9aBc2"
}
```

### Access Short URL
**Request:**
```http
GET /xYz9aBc2 HTTP/1.1
```

**Response:**
```http
HTTP/1.1 302 Found
Location: https://www.google.com/search?q=nodejs
```

### Get Analytics
**Request:**
```http
GET /url/analytics/xYz9aBc2 HTTP/1.1
```

**Response:**
```json
{
  "totalClicks": 5,
  "analytics": [
    { "timestamp": 1704067200000 },
    { "timestamp": 1704067300000 },
    { "timestamp": 1704067400000 },
    { "timestamp": 1704067500000 },
    { "timestamp": 1704067600000 }
  ]
}
```

## Notes

- The application uses MongoDB's atomic operations to ensure accurate click counting
- Short IDs are generated client-side using nanoid, ensuring uniqueness
- Visit history is stored as an array of timestamp objects
- The redirect endpoint (`/:shortId`) must be placed after other routes to avoid conflicts
