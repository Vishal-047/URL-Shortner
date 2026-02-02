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
    const allURLs=await URL.find({});
    return res.render("home",{
        id:shortId,
        urls:allURLs,
    })
}

async function analytics(req,res) {
    const shortId=req.params.shortId;
    const result=await URL.findOne({shortId});
    if(!result){
        return res.status(404).json({error:"Short URL not found"});
    }
    return res.json({
        totalClicks:result.visitHistory ? result.visitHistory.length : 0,
        analytics: result.visitHistory || [],
    })
}

module.exports={handleURL,analytics};