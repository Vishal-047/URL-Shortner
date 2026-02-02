const express=require("express");
const {handleuser,handlelogin,handlelogout} = require("../controller/user");
const router=express.Router();


router.post('/',handleuser);
router.post('/login',handlelogin);
router.get('/logout',handlelogout);

module.exports=router;