const {nanoid} =require("nanoid")
const URL=require("../model/url")
async function handleURL(req,res){
    const body=req.body;
    if(!body.url){
        return res.status(400).json({status:"Url is missing"})
    }
    
    // Ensure URL has a protocol
    let urlToSave = body.url.trim();
    if(!urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')){
        urlToSave = 'https://' + urlToSave;
    }
    
    const shortId=nanoid(8);
    await URL.create({
        shortId,
        redirectedURL:urlToSave,
        visitHistory:[],
        createdBy:req.user._id,
    });
    // Fetch only URLs created by this user
    const allURLs=await URL.find({createdBy:req.user._id});
    return res.render("home",{
        id:shortId,
        urls:allURLs,
        user:req.user
    })
}

async function analytics(req,res) {
    const shortId=req.params.shortId;
    // Only allow users to see analytics for their own URLs
    const result=await URL.findOne({shortId, createdBy:req.user._id});
    if(!result){
        return res.status(404).json({error:"Short URL not found or you don't have access"});
    }
    return res.json({
        totalClicks:result.visitHistory ? result.visitHistory.length : 0,
        analytics: result.visitHistory || [],
    })
}

module.exports={handleURL,analytics};