# 🎬 TwiTube: Online Video Platform (OVP) & Microblogging Engine
[Link](https://twitube-backend-0o2g.onrender.com/api/v1)

A production-grade, highly scalable backend engine for **TwiTube** — a hybrid platform merging high-throughput **Online Video Streaming (OVP)** with real-time **Social Microblogging (Twitter-style feeds)**. Built from first principles using **Node.js, Express.js, MongoDB, and Cloudinary**, engineered with enterprise security, dual-token JWT authentication, multi-stage aggregation pipelines, database indexing, rate limiting, and centralized error handling.

> 📐 **Data Model Architecture:** [Eraser.io Database Diagram](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

---

## 🚀 Tech Stack & Tools

- **Runtime & Framework:** Node.js (ES6+ Modules), Express.js (v5)
- **Database & ODM:** MongoDB, Mongoose (v9), `mongoose-aggregate-paginate-v2`
- **Authentication & Security:** JWT (Access & Refresh Tokens), bcrypt (Password Hashing), Helmet (HTTP Header Hardening), `express-rate-limit` (DDoS & Brute-force Prevention)
- **File & Media Storage:** Multer (Local disk buffer), Cloudinary SDK (Image & Video CDN Uploads, Transcoding & Asset Lifecycle)
- **Utilities:** Cookie-Parser, CORS, Prettier, Nodemon

---

## 🏗️ Architectural & Engineering Highlights

- **JWT Dual-Token Rotation:** Short-lived access tokens (15m-1d) for stateless authorization coupled with securely stored, single-use rotating refresh tokens (10d) in HTTP-only cookies.
- **Advanced Aggregation Pipelines:** Optimized relational joins using `$lookup`, `$facet`, `$unwind`, `$match`, and `$addFields` for fast subscriber counts, channel subscription state, view counter aggregations, and paginated comment trees.
- **Atomic MongoDB Mutations:** Thread-safe, race-condition-resistant operations using `$addToSet` and `$pull` for playlist management and unique user subscriptions.
- **Text & Compound Indexing:** Full-text inverted indexes on video titles and descriptions for high-speed search, paired with compound unique indexes (`{ subscriber: 1, channel: 1 }`) to eliminate duplicate database records.
- **Media Asset Lifecycle Management:** Automated local disk cleanup via `fs.unlinkSync` upon Cloudinary delivery, with dedicated `resource_type: "video"` handling on media deletion.
- **Enterprise Error Handling:** Standardized `ApiError` and `ApiResponse` envelopes with custom Express global error-handling middleware preventing stack-trace leaks in production.

---

## 📂 Project Structure

```text
src/
├── controllers/          # Business logic handlers
│   ├── comment.controller.js
│   ├── dashboard.controller.js
│   ├── healthcheck.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── tweet.controller.js
│   ├── user.controller.js
│   └── video.controller.js
├── db/                   # MongoDB connection logic
│   └── index.js
├── middlewares/          # Express request interceptors
│   ├── auth.middleware.js       # verifyJWT token extraction & verification
│   └── multer.middleware.js     # Multipart file processing
├── models/               # Mongoose schema definitions
│   ├── comment.models.js
│   ├── like.models.js
│   ├── playlist.models.js
│   ├── subscription.models.js
│   ├── tweet.models.js
│   ├── user.models.js
│   └── video.models.js
├── routes/               # Express REST route definitions
│   ├── comment.routes.js
│   ├── dashboard.routes.js
│   ├── healthcheck.routes.js
│   ├── like.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── tweet.routes.js
│   ├── user.routes.js
│   └── video.routes.js
├── utils/                # Reusable engineering utilities
│   ├── ApiError.js              # Standardized HTTP error class
│   ├── ApiResponse.js           # Consistent JSON response envelope
│   ├── asyncHandler.js          # Promise wrapper eliminating try/catch boilerplate
│   └── cloudinary.js            # Media upload and deletion helpers
├── app.js                # Express app configuration & middleware pipeline
├── constants.js          # Global application constants
└── index.js              # Application entry point & server listener
```

---

## 📡 API Reference

- **🌐 Live Production URL:** `https://twitube-backend-0o2g.onrender.com/api/v1`
- **💻 Local Development URL:** `http://localhost:8000/api/v1`

### 1. Healthcheck
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/healthcheck` | Public | Returns server health and status |

### 2. Authentication & Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Public | Register new user with avatar & cover image |
| `POST` | `/users/login` | Public (Rate-limited) | Login user and issue Access & Refresh tokens |
| `POST` | `/users/logout` | Protected | Logout user and clear tokens |
| `POST` | `/users/refresh-token` | Public | Renew expired access token using refresh token |
| `POST` | `/users/change-password` | Protected | Update user password |
| `GET` | `/users/current-user` | Protected | Fetch authenticated user profile |
| `PATCH`| `/users/update-account` | Protected | Update full name and email |
| `PATCH`| `/users/avatar` | Protected | Upload new avatar image to Cloudinary |
| `PATCH`| `/users/cover-image` | Protected | Upload new cover image to Cloudinary |
| `GET` | `/users/c/:username` | Protected | Get channel profile with subscriber stats |
| `GET` | `/users/history` | Protected | Get user watch history with video aggregation |

### 3. Video Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/videos` | Public | Search, sort, and paginate videos (`?page=1&limit=10&query=...`) |
| `POST` | `/videos` | Protected | Upload video file and thumbnail to Cloudinary |
| `GET` | `/videos/:videoId` | Protected | Fetch video details, owner profile, and increment views |
| `PATCH`| `/videos/:videoId` | Protected | Update title, description, or thumbnail |
| `DELETE`| `/videos/:videoId` | Protected | Delete video and thumbnail from Cloudinary and DB |
| `PATCH`| `/videos/toggle/publish/:videoId` | Protected | Toggle video public/private visibility |

### 4. Comments
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/comments/:videoId` | Public | Paginated comments for a video with user profiles & likes count |
| `POST` | `/comments/:videoId` | Protected | Add a new comment to a video |
| `PATCH`| `/comments/c/:commentId` | Protected | Edit comment content |
| `DELETE`| `/comments/c/:commentId` | Protected | Delete a comment |

### 5. Likes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/likes/toggle/v/:videoId` | Protected | Toggle like on a video |
| `POST` | `/likes/toggle/c/:commentId` | Protected | Toggle like on a comment |
| `POST` | `/likes/toggle/t/:tweetId` | Protected | Toggle like on a tweet |
| `GET` | `/likes/videos` | Protected | Get all videos liked by authenticated user |

### 6. Subscriptions
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/subscriptions/c/:channelId` | Protected | Toggle subscribe / unsubscribe to a channel |
| `GET` | `/subscriptions/c/:channelId` | Protected | Get list of subscribers for a channel |
| `GET` | `/subscriptions/u/:subscriberId` | Protected | Get list of channels a user has subscribed to |

### 7. Playlists
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/playlists` | Protected | Create a new playlist |
| `GET` | `/playlists/:playlistId` | Public | Fetch playlist details with populated video documents |
| `GET` | `/playlists/user/:userId` | Public | Fetch all public playlists for a user |
| `PATCH`| `/playlists/:playlistId` | Protected | Update playlist title and description |
| `DELETE`| `/playlists/:playlistId` | Protected | Delete a playlist |
| `PATCH`| `/playlists/add/:videoId/:playlistId` | Protected | Add video to playlist (`$addToSet`) |
| `PATCH`| `/playlists/remove/:videoId/:playlistId`| Protected | Remove video from playlist (`$pull`) |

### 8. Community Tweets
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/tweets` | Protected | Publish a community tweet |
| `GET` | `/tweets/user/:userId` | Public | Fetch user tweets with author profile and like counts |
| `PATCH`| `/tweets/:tweetId` | Protected | Edit tweet content |
| `DELETE`| `/tweets/:tweetId` | Protected | Delete a tweet |

### 9. Creator Dashboard
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Protected | Creator analytics (Total Views, Subscribers, Videos, Likes) |
| `GET` | `/dashboard/videos` | Protected | Get all uploaded creator videos (published & unpublished drafts) |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys (refer to `.env.sample`):

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/youtube-clone-backend.git
   cd youtube-clone-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.sample .env
   # Fill in your MongoDB connection string and Cloudinary credentials
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Verify the server is running:**
   Visit `http://localhost:8000/api/v1/healthcheck` in your browser or Postman.

---

## 🛡️ Security Best Practices Implemented

- **Password Hashing:** Passwords are never stored in plaintext; salted and hashed with `bcrypt` (10 rounds).
- **HTTP-Only Cookies:** Tokens stored in cookies are flagged `httpOnly: true` and `secure: true` to prevent Cross-Site Scripting (XSS) extraction.
- **Resource Ownership Verification:** Strict authorization gates guarantee that only document owners can update or delete videos, tweets, comments, and playlists.
- **DDoS & Spam Mitigation:** Rate limiting caps burst requests to 100 per 15 minutes, with dedicated limits on authentication routes.
- **Secure File Validation:** Uploads are strictly intercepted, validated, and scrubbed from the local filesystem immediately after Cloudinary CDN ingestion.

---

## 👤 Author

**Harsh Hublikar**  
- GitHub: [@aiharshh](https://github.com/aiharshh)
