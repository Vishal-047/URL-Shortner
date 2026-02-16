const express = require("express");
const router = express.Router();
const URL = require("../model/url");
router.get('/', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    // Show only URLs created by this user
    const allURLs = await URL.find({ createdBy: req.user._id });
    return res.render('home', {
        urls: allURLs,
        user: req.user,
        id: req.query.generatedId
    });
})

router.get('/signup', (req, res) => {
    return res.render("signup");
});
router.get('/login', (req, res) => {
    return res.render("login");
});

module.exports = router;