const express = require("express");
const { handleURL, analytics, handleDelete } = require("../controller/url");
const router = express.Router();

router.post('/', handleURL);
router.post('/delete', handleDelete);
router.get('/analytics/:shortId', analytics)
module.exports = router;