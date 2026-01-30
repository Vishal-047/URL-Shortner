const express=require("express");
const routeURL = require("./routes/url");
const connection=require("./connection")
const app=express();
const path=require("path");
const PORT=8001;
const URL =require("./model/url");
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const userRoute=require('./routes/user');
const staticRoute=require("./routes/staticRouter");


app.set("view engine","ejs");
app.set("views", path.resolve("./views"));

app.use('/url',routeURL)
app.use('/user',userRoute)
app.use('/',staticRoute);

// This route should be last to avoid catching other routes
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
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("Error occured: ",err));