const express=require("express");
const routeURL = require("./routes/url");
const connection=require("./connection")
const app=express();
const PORT=8001;
const URL =require("./model/url")
app.use(express.json());

app.use('/url',routeURL)

app.get('/:shortId',async (req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate({
        shortId:shortId,

    },{
        $inc:{TotalClicks:1},
        $push: {
        visitHistory:{timestamp:Date.now(),},

    },},);
    if(!entry){
        return res.status(404).send("Short URL not found");
    }
    res.redirect(entry.redirectedURL);
})

app.listen(PORT, ()=>console.log(`Server started on Port: ${PORT}`));

connection('mongodb://127.0.0.1:27017/short-url')
.then(console.log("Server started"))
.catch(err=>console.log("Error occured: ",err));