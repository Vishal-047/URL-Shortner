# URL Shortener

A simple and efficient URL shortener service built with Node.js, Express.js, and MongoDB. This application allows you to shorten long URLs and track analytics including total clicks and visit history.

## Features

- 🔗 **URL Shortening**: Convert long URLs into short, manageable links
- 📊 **Analytics**: Track total clicks and visit history for each shortened URL
- ⚡ **Fast & Lightweight**: Built with Express.js for optimal performance
- 🗄️ **MongoDB Integration**: Persistent storage with MongoDB
- 🔍 **Unique Short IDs**: Uses nanoid to generate unique 8-character short IDs

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **nanoid** - Unique ID generation

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

## API Endpoints

### Create Short URL

**POST** `/url`

Creates a new short URL from a long URL.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "id": "abc12345",
  "Shorten_URL": "http://localhost:8001/abc12345"
}
```

### Redirect to Original URL

**GET** `/:shortId`

Redirects to the original URL associated with the short ID.

**Example:**
```
GET http://localhost:8001/abc12345
```

### Get Analytics

**GET** `/url/analytics/:shortId`

Retrieves analytics data for a specific short URL.

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

## Project Structure

```
urlShortner/
├── index.js           # Main server file
├── connection.js      # MongoDB connection handler
├── controller/
│   └── url.js        # URL controller logic
├── routes/
│   └── url.js        # URL routes
├── model/
│   └── url.js        # URL data model
└── package.json      # Dependencies and scripts
```

## Database Schema

The URL model includes:
- `shortId`: Unique identifier for the shortened URL
- `redirectedURL`: Original URL to redirect to
- `TotalClicks`: Total number of clicks
- `visitHistory`: Array of visit timestamps
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Development

The project uses `nodemon` for automatic server restarts during development. The server will automatically restart when you make changes to the code.

## License

ISC

## Author

Vishal
