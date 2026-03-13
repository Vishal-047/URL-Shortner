require('dotenv').config({ quiet: true });
const express = require("express");
const routeURL = require("./routes/url");
const connection = require("./connection")
const app = express();
const cookieparser = require("cookie-parser")
const { restrictUser, checkAuth } = require("./middleware/auth");
const path = require("path");
const PORT = 8001;
const URL = require("./model/url");
app.use(express.json());

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

    const entry = await URL.findOneAndUpdate({
        shortId: shortId,
    }, {
        $inc: { TotalClicks: 1 },
        $push: {
            visitHistory: { timestamp: Date.now() },
        },
    });

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    // Ensure the redirect URL has a protocol
    let redirectUrl = entry.redirectedURL;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = 'https://' + redirectUrl;
    }

    res.redirect(redirectUrl);
})

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/short-url';

connection(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => console.log("Error occured: ", err));

// Start server if safely outside Vercel's serverless production environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server started on Port: ${PORT}`));
}

// Export the Express app as a serverless function handler for Vercel
module.exports = app;