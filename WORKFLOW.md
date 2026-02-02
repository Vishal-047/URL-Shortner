# URL Shortener Application Workflow

This document explains the complete workflow of the URL Shortener application, detailing how requests flow through the system, including user authentication.

## Application Architecture

```
Client Request
    ↓
Express Server (index.js)
    ↓
Middleware (middleware/auth.js)
    ↓
Routes (routes/user.js, routes/url.js, routes/staticRouter.js)
    ↓
Controller (controller/user.js, controller/url.js)
    ↓
Model (model/user.js, model/url.js)
    ↓
MongoDB Database
```

## Workflow Overview

### 1. Application Initialization

**File: `index.js`**

1. Express server is initialized.
2. Middleware is configured:
   - `express.json()` for parsing JSON request bodies.
   - `express.urlencoded()` for parsing form data.
   - `cookie-parser()` for parsing cookies.
3. EJS view engine is set up.
4. Routes are registered:
   - `/` (static pages) are handled by `routes/staticRouter.js` with `checkAuth` middleware.
   - `/user` routes are handled by `routes/user.js`.
   - `/url` routes are handled by `routes/url.js` and protected by `restrictUser` middleware.
5. Server starts listening on port 8001.
6. MongoDB connection is established.

### 2. User Signup Workflow

**Endpoint: `POST /user`**

```
Step 1: Client submits signup form
   POST http://localhost:8001/user
   Body: { "name": "Test User", "email": "test@example.com", "password": "password" }
        ↓
Step 2: Request routed to routes/user.js
   Router matches POST '/' route
        ↓
Step 3: Controller handles request (controller/user.js → handleuser)
   - Validates that name, email, and password are provided.
   - If any field is missing, it re-renders the signup page with an error.
        ↓
Step 4: Create User in Database
   - Creates a new user document in the `users` collection.
   - If the email already exists, it re-renders the signup page with an error.
        ↓
Step 5: Redirect to Login
   - On successful creation, redirects the user to the `/login` page.
```

### 3. User Login Workflow

**Endpoint: `POST /user/login`**

```
Step 1: Client submits login form
   POST http://localhost:8001/user/login
   Body: { "email": "test@example.com", "password": "password" }
        ↓
Step 2: Request routed to routes/user.js
   Router matches POST '/login' route
        ↓
Step 3: Controller handles request (controller/user.js → handlelogin)
   - Finds the user by email in the database.
   - If the user is not found or the password doesn't match, it re-renders the login page with an error.
        ↓
Step 4: Generate JWT (service/auth.js → setUser)
   - Creates a JWT containing the user's `_id` and `email`.
   - The token is signed with a secret key and has an expiration time.
        ↓
Step 5: Set Cookie and Redirect
   - Sets an HTTP-only cookie named `uid` with the generated JWT.
   - Redirects the user to the home page (`/`).
```

### 4. User Logout Workflow

**Endpoint: `GET /user/logout`**

```
Step 1: Client clicks the logout link
   GET http://localhost:8001/user/logout
        ↓
Step 2: Request routed to routes/user.js
   Router matches GET '/logout' route
        ↓
Step 3: Controller handles request (controller/user.js → handlelogout)
   - Clears the `uid` cookie from the browser.
        ↓
Step 4: Redirect to Login
   - Redirects the user to the `/login` page.
```

### 5. Create Short URL Workflow (Authenticated)

**Endpoint: `POST /url`**

```
Step 1: Authenticated client sends POST request from the home page form
   POST http://localhost:8001/url
   Header: Cookie: uid=<jwt_token>
   Body: { "url": "https://example.com/long-url" }
        ↓
Step 2: Middleware authenticates user (middleware/auth.js → restrictUser)
   - Verifies the JWT from the `uid` cookie.
   - If the token is invalid or missing, it redirects to `/login`.
   - If valid, it attaches the user payload to the request (`req.user`) and proceeds.
        ↓
Step 3: Request routed to routes/url.js
   Router matches POST '/' route
        ↓
Step 4: Controller handles request (controller/url.js → handleURL)
   - Validates that the `url` is present in the request body.
   - Generates a unique short ID using `nanoid(8)`.
        ↓
Step 5: Save to Database
   - Creates a new URL document in the `urls` collection.
   - Associates the URL with the authenticated user via `createdBy: req.user._id`.
        ↓
Step 6: Render Response
   - Re-renders the home page (`home.ejs`), displaying the list of the user's URLs, including the newly created one.
```

### 6. Redirect to Original URL Workflow (Public)

**Endpoint: `GET /:shortId`**

This workflow is public and does not require authentication.

```
Step 1: Client accesses a short URL
   GET http://localhost:8001/abc12345
        ↓
Step 2: Express matches the dynamic route in index.js
   - Extracts `shortId` from the URL parameters.
        ↓
Step 3: Database Query & Update
   - Finds the URL document by `shortId`.
   - Atomically increments `TotalClicks` by 1.
   - Pushes a new timestamp to the `visitHistory` array.
        ↓
Step 4: Redirect Response
   - If the entry is not found, returns a 404 error.
   - If found, it issues an HTTP 302 redirect to the original `redirectedURL`.
```

### 7. Analytics Workflow (Authenticated)

**Endpoint: `GET /url/analytics/:shortId`**

```
Step 1: Authenticated client requests analytics
   GET http://localhost:8001/url/analytics/abc12345
   Header: Cookie: uid=<jwt_token>
        ↓
Step 2: Middleware authenticates user (middleware/auth.js → restrictUser)
   - Verifies the JWT from the `uid` cookie.
        ↓
Step 3: Request routed to routes/url.js
   Router matches GET '/analytics/:shortId' route
        ↓
Step 4: Controller handles request (controller/url.js → analytics)
   - Extracts `shortId` from URL parameters.
        ↓
Step 5: Database Query
   - Finds the URL document where `shortId` matches and `createdBy` matches the authenticated user's ID (`req.user._id`).
   - This ensures users can only access analytics for their own URLs.
   - If no document is found, returns a 404 error.
        ↓
Step 6: Return JSON Response
   - Returns a JSON object with `totalClicks` and the `analytics` (visit history) array.
```

## Database Schema

### `users` Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### `urls` Collection
```javascript
{
  shortId: String (required, unique),
  redirectedURL: String (required),
  TotalClicks: Number (default: 0),
  visitHistory: [ { timestamp: Number } ],
  createdBy: ObjectId (ref: 'users'), // Foreign key to the users collection
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Key Components

### 1. **Short ID Generation**
- Uses the `nanoid` library to generate 8-character unique, URL-safe identifiers.

### 2. **Click Tracking**
- Uses MongoDB's atomic operations (`$inc`, `$push`) to prevent race conditions and ensure accurate click counting.

### 3. **Authentication**
- Uses JSON Web Tokens (JWT) for stateless authentication.
- The `jsonwebtoken` library signs and verifies tokens.
- On login, a JWT is stored in an HTTP-only `uid` cookie.
- `restrictUser` middleware protects routes by requiring a valid JWT.
- `checkAuth` middleware makes user information available to views if a valid JWT is present, without blocking access.

### 4. **Error Handling**
- **400 Bad Request**: Missing URL in the request body.
- **404 Not Found**: Short URL doesn't exist or the user doesn't have access.
- Renders pages with error messages for invalid login, signup, etc.