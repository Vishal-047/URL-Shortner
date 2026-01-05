const express=require("express");
const handleURL = require("../controller/url");
const analytics = require("../controller/url");
const router=express.Router();

router.post('/',handleURL);
router.get('/analytics/:shortId',analytics)
module.exports=router;