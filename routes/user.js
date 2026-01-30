const express=require("express");
const {handleuser,handlelogin} = require("../controller/user");
const router=express.Router();


router.post('/',handleuser);
router.post('/login',handlelogin);

module.exports=router;