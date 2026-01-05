const {nanoid} =require("nanoid")
const URL=require("../model/url")
async function handleURL(req,res){
    const body=req.body;
    if(!body.url){
        return res.status(400).json({status:"Url is missing"})
    }
    const shortId=nanoid(8);
    await URL.create({
        shortId,
        redirectedURL:body.url,
        visitHistory:[],
    });
    return res.json({id:shortId,
        Shorten_URL:`http://localhost:8001/${shortId}`,
    });
}

async function analytics(req,res) {
    const shortId=req.params.shortId;
    const result=await URL.findOne({shortId});
    return res.json({totalClicks:result.visitHistory.length,
        analytics: result.visitHistory,
    })
}

module.exports=handleURL;
module.exports=analytics;