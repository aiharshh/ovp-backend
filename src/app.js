import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express()

// This tells attackers your exact server framework! 
// The package helmet sets 15 + secure HTTP headers(hiding X - Powered - By
// 1. Security Headers & CORS
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// 2. Request parsers
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// 3. General rate limiter for all API roues
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes 
    max: 100, // Limit each IP to 100 requests per window - only 100 attempts
    message: {
        statusCode: 429,
        success: false,
        message: "Too many requests, please try again after 15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false, // disable the 'X-RateLimit-*' headers
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many failed login attempts, please try again in 15 minutes"
});

app.use("/api/v1", apiLimiter);
app.use("/api/v1/users/login", loginLimiter);

// 4. routes import 
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//5.  routes declaration
app.use("/api/v1/users", userRouter) 
// http://localhost:8000/api/v1/users/register -> register is in user.routes.js 
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// 6. Global Error Handling Middleware - always at end
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    return res
        .status(statusCode)
        .json({
            statusCode,
            data: null,
            message: err.message || "Internal Server Error",
            success: false,
            errors: err.errors || []
        });
});

export { app }