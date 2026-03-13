const express = require("express");
const { handleuser, handlelogin, handlelogout, handleDeleteAccount } = require("../controller/user");
const { restrictUser } = require("../middleware/auth");
const router = express.Router();


router.post('/', handleuser);
router.post('/login', handlelogin);
router.get('/logout', handlelogout);
router.post('/delete-account', restrictUser, handleDeleteAccount);

module.exports = router;