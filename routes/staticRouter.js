const express=require("express");
const router=express.Router();
const URL=require("../model/url");
router.get('/',async (req,res)=>{
    const allURLs=await URL.find({});
   return res.render('home',{
    urls:allURLs,

   });
})

router.get('/signup',(req,res)=>{
    return res.render("signup");
});
router.get('/login',(req,res)=>{
    return res.render("login");
});

module.exports=router;