# URL Shortener

A simple and efficient URL shortener service built with Node.js, Express.js, and MongoDB. This application allows users to shorten long URLs, track analytics for their own links, and manage them through a user-friendly interface. The application is secured with JWT-based authentication.

## Features

- 🔗 **URL Shortening**: Convert long URLs into short, manageable links.
- 🔐 **User Authentication**: Secure user accounts with JWT-based authentication (signup, login, logout).
- 👤 **User-Specific URLs**: Users can only view and manage their own shortened URLs.
- 📊 **Analytics**: Track total clicks and visit history for each shortened URL.
- ⚡ **Fast & Lightweight**: Built with Express.js for optimal performance.
- 🗄️ **MongoDB Integration**: Persistent storage with MongoDB.
- 🔍 **Unique Short IDs**: Uses `nanoid` to generate unique 8-character short IDs.
- 🖥️ **EJS Templating**: Server-side rendered views with EJS.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **EJS** - Template engine
- **nanoid** - Unique ID generation
- **jsonwebtoken** - For JWT-based authentication
- **cookie-parser** - For handling cookies

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd urlShortner
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod
```

4. Update the MongoDB connection string in `index.js` if needed (default: `mongodb://127.0.0.1:27017/short-url`)

## Usage

1. Start the server:
```bash
npm start
```

The server will start on `http://localhost:8001`

## Web Routes

-   `GET /`: Home page. Displays the URL shortening form and a list of the user's shortened URLs. (Requires login)
-   `GET /signup`: Renders the signup page.
-   `GET /login`: Renders the login page.
-   `GET /user/logout`: Logs the user out.

## API Endpoints

### Create Short URL

**POST** `/url` (Protected)

Creates a new short URL from a long URL for the authenticated user.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
Renders the home page with the newly created short URL.

### Redirect to Original URL

**GET** `/:shortId`

Redirects to the original URL associated with the short ID and tracks the click.

**Example:**
`GET http://localhost:8001/abc12345`

### Get Analytics

**GET** `/url/analytics/:shortId` (Protected)

Retrieves analytics data for a specific short URL belonging to the authenticated user.

**Response:**
```json
{
  "totalClicks": 10,
  "analytics": [
    {
      "timestamp": 1234567890
    },
    ...
  ]
}
```

### User Authentication

**POST** `/user`

Registers a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```
**Response:** Redirects to `/login`.

**POST** `/user/login`

Logs in a user and sets an HTTP-only cookie with a JWT.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
**Response:** Redirects to `/`.

## Project Structure

```
urlShortner/
├── index.js                # Main server file
├── connection.js           # MongoDB connection handler
├── WORKFLOW.md             # Detailed application workflow
├── package.json            # Dependencies and scripts
├── .gitignore              # Git ignore file
├── middleware/
│   └── auth.js             # Authentication middleware (JWT)
├── controller/
│   ├── url.js              # URL controller logic
│   └── user.js             # User controller logic (signup, login)
├── routes/
│   ├── url.js              # URL routes
│   ├── user.js             # User authentication routes
│   └── staticRouter.js     # Routes for serving EJS views
├── model/
│   ├── url.js              # URL data model (Mongoose schema)
│   └── user.js             # User data model (Mongoose schema)
├── service/
│   └── auth.js             # JWT service for creating and verifying tokens
└── views/
    ├── home.ejs            # Home page view
    ├── login.ejs           # Login page view
    └── signup.ejs          # Signup page view
```

## Troubleshooting

### MongoDB Connection Error
If you encounter `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` or buffering timeouts:
1. Ensure the MongoDB service is running on your machine.
   - Windows: Check Services (`services.msc`) for `MongoDB Server`.
   - Linux/Mac: Run `sudo systemctl status mongod` or `brew services list`.
2. Verify the connection string in `index.js`. The default is `mongodb://127.0.0.1:27017/short-url`. Using `127.0.0.1` is often more reliable than `localhost`.

## Database Schema

### URL Schema

The URL model (`urls` collection) includes:
- `shortId`: Unique identifier for the shortened URL
- `redirectedURL`: Original URL to redirect to
- `TotalClicks`: Total number of clicks
- `visitHistory`: Array of visit timestamps
- `createdBy`: ObjectId of the user who created the URL
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

### User Schema

The User model (`users` collection) includes:
- `name`: User's full name
- `email`: User's email (unique)
- `password`: User's password
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Development

The project uses `nodemon` for automatic server restarts during development. The server will automatically restart when you make changes to the code.

## License

ISC

## Author

Vishal