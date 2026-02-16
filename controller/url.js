const { nanoid } = require("nanoid")
const URL = require("../model/url")
async function handleURL(req, res) {
    const body = req.body;
    if (!body.url) {
        return res.status(400).json({ status: "Url is missing" })
    }

    // Ensure URL has a protocol
    let urlToSave = body.url.trim();
    if (!urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')) {
        urlToSave = 'https://' + urlToSave;
    }

    // Check if URL already exists for this user
    const existingURL = await URL.findOne({ redirectedURL: urlToSave, createdBy: req.user._id });

    if (existingURL) {
        return res.redirect(`/?generatedId=${existingURL.shortId}`);
    }

    const shortId = nanoid(8);
    await URL.create({
        shortId,
        redirectedURL: urlToSave,
        visitHistory: [],
        createdBy: req.user._id,
    });
    // Fetch only URLs created by this user
    const allURLs = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
        id: shortId,
        urls: allURLs,
        user: req.user
    })
}

async function analytics(req, res) {
    const shortId = req.params.shortId;
    // Only allow users to see analytics for their own URLs
    const result = await URL.findOne({ shortId, createdBy: req.user._id });
    if (!result) {
        return res.status(404).json({ error: "Short URL not found or you don't have access" });
    }
    return res.json({
        totalClicks: result.visitHistory ? result.visitHistory.length : 0,
        analytics: result.visitHistory || [],
    })
}

async function handleDelete(req, res) {
    try {
        const { shortIds } = req.body;
        console.log("Delete request received. Body:", req.body);

        let idsToDelete = [];
        if (shortIds) {
            if (Array.isArray(shortIds)) {
                idsToDelete = shortIds;
            } else if (typeof shortIds === 'object') {
                // Handle case where it's parsed as an object { '0': 'id1', '1': 'id2' }
                idsToDelete = Object.values(shortIds);
            } else {
                // Single string
                idsToDelete = [shortIds];
            }

            console.log("IDs to delete:", idsToDelete);
            const result = await URL.deleteMany({ shortId: { $in: idsToDelete }, createdBy: req.user._id });
            console.log("Delete result:", result);
        } else {
            console.log("No IDs provided for deletion");
        }
        return res.redirect('/');
    } catch (error) {
        console.error("Error deleting URLs:", error);
        return res.status(500).send("Internal Server Error: " + error.message);
    }
}

module.exports = { handleURL, analytics, handleDelete };