const { getUser } = require("../service/auth");

function restrictUser(req, res, next) {
    const userUid = req.cookies.uid;
    if (!userUid) {
        return res.redirect(302, "/login");
    }
    const user = getUser(userUid);
    if (!user) {
        res.clearCookie("uid");                 // clean up invalid/expired token
        return res.redirect(302, "/login");
    }
    req.user = user;
    return next();
}

function checkAuth(req, res, next) {
    const userUid = req.cookies.uid;
    if (userUid) {
        const user = getUser(userUid);
        req.user = user || null;               // don't attach null user silently
    }
    return next();
}

module.exports = { restrictUser, checkAuth };