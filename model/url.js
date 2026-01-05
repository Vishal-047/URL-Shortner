const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    shortId:{
        require:true,
        unique:true,
        type:String,
    },
    redirectedURL:{
        type:String,
        require:true,
    },
    TotalClicks:{
        type:Number,
        default:0,
    },
    visitHistory:[{
        timestamp:{type:Number},
    }]
},
{timestamps:true}
)

const URL=mongoose.model('url',schema);
module.exports=URL;