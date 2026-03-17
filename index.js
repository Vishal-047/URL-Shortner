require('dotenv').config({ quiet: true });
const express = require("express");
const routeURL = require("./routes/url");
const connection = require("./connection")
const app = express();
const cookieparser = require("cookie-parser")
const { restrictUser, checkAuth } = require("./middleware/auth");
const { connectRedis, getCachedRedirectUrl, setCachedRedirectUrl } = require("./service/cache");
const path = require("path");
const PORT = 8001;
const URL = require("./model/url");
app.use(express.json());
function ensureProtocol(url) {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

const userRoute = require('./routes/user');
const staticRoute = require("./routes/staticRouter");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "public")));



app.use('/url', restrictUser, routeURL)
app.use('/user', userRoute)
app.use('/', checkAuth, staticRoute);

// This route should be last to avoid catching other routes
app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;

    // Skip if it's a known route
    if (['signup', 'login', 'url', 'user'].includes(shortId)) {
        return res.status(404).send("Page not found");
    }

    const cachedRedirectUrl = await getCachedRedirectUrl(shortId);
    if (cachedRedirectUrl) {
        URL.updateOne(
            { shortId },
            {
                $inc: { TotalClicks: 1 },
                $push: { visitHistory: { timestamp: Date.now() } },
            }
        ).catch((err) => console.error("Click tracking update failed:", err.message));
        return res.redirect(ensureProtocol(cachedRedirectUrl));
    }

    const entry = await URL.findOneAndUpdate(
        { shortId },
        {
            $inc: { TotalClicks: 1 },
            $push: { visitHistory: { timestamp: Date.now() } },
        }
    );

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    const redirectUrl = ensureProtocol(entry.redirectedURL);
    await setCachedRedirectUrl(shortId, redirectUrl);
    return res.redirect(redirectUrl);
})

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/short-url';

let isConnected = false;

// We export an async function as the Vercel handler
module.exports = async (req, res) => {
    // Only connect if we don't already have an active connection
    if (!isConnected) {
        try {
            await connection(MONGO_URI, {
                serverSelectionTimeoutMS: 5000 
            });
            await connectRedis();
            isConnected = true;
            console.log("MongoDB connected");
        } catch (err) {
            console.error("MongoDB connection Error:", err);
            return res.status(500).json({ error: "Failed to connect to database" });
        }
    }
    
    // Once connected, pass the request to Express
    return app(req, res);
};

// Keep local development working
if (process.env.NODE_ENV !== 'production') {
    connection(MONGO_URI)
        .then(() => {
            connectRedis().catch((err) => console.error("Redis connection Error:", err.message));
            console.log("Local MongoDB connected");
            app.listen(PORT, () => console.log(`Server started on Port: ${PORT}`));
        })
        .catch(err => console.log("Local MongoDB Error: ", err));
}
