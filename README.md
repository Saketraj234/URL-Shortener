# LinkForge - Premium URL Shortener

A modern, premium URL shortener built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and MongoDB.

## Features

- ✨ **Instant URL Shortening**: Create short links in milliseconds
- 📱 **QR Code Generation**: Generate scannable QR codes for all links
- 📈 **Click Analytics**: Track and monitor click statistics
- 🔍 **URL Search**: Search through your created URLs
- 🗑️ **Delete Links**: Remove links when no longer needed
- ⏰ **Auto Expiry**: Links automatically expire after 24 hours (MongoDB TTL index)
- 🎨 **Premium UI**: Modern SaaS-style interface with glassmorphism and animated background
- 📱 **Fully Responsive**: Works perfectly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Libraries**: nanoid, qrcodejs

## Installation & Setup

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkforge
```

### 4. Start MongoDB

Ensure MongoDB is running locally or update the `MONGODB_URI` to your MongoDB Atlas connection string.

### 5. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:5000`

## Project Structure

```
linkforge/
├── public/
│   ├── index.html       # Main landing page and dashboard
│   ├── style.css        # Premium styling with glassmorphism
│   ├── script.js        # Frontend functionality
│   └── expired.html     # Expired link page
├── config/
│   └── db.js            # MongoDB connection
├── models/
│   └── Url.js           # URL model with TTL index
├── controllers/
│   └── urlController.js # Business logic
├── routes/
│   └── urlRoutes.js     # API routes
├── middleware/
│   └── errorHandler.js  # Error handling
├── .env                 # Environment variables
├── server.js            # Main server file
└── package.json
```

## API Endpoints

- `POST /api/shorten` - Create a new short URL
- `GET /api/urls` - Get all URLs
- `DELETE /api/url/:id` - Delete a URL
- `GET /api/analytics` - Get analytics data
- `GET /:shortCode` - Redirect to original URL

## License

MIT
