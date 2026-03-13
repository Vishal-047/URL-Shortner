// const http=require("http");
// const fs=require("fs");
// const url=require("url");
const express=require("express");

const app=express();

app.get("/",(req,res)=>{
    return res.end(`Hello ${req.query.name}, this is a home page`);
})
app.get("/about",(req,res)=>{
    return res.end(`Hello ${req.query.name}, this is a about page`);
})
app.get("/contact",(req,res)=>{
    return res.end(`Hello ${req.query.name}, this is a contact page`);
})

app.listen(8000,()=>console.log("Server satrted vishal!"));

// const server=http.createServer((req,res)=>{
//     if(req.url==="/favicon.ico") return res.end();
//     fs.appendFile("log.txt",`${new Date().toISOString()}: ${req.method} ${req.url}\n`,(err)=>{
//         console.log(err);
//     });
//     const myurl=url.parse(req.url,true);
//     console.log(myurl);
//     const name=myurl.query.myname;
//     switch(myurl.pathname){
//         case "/":
//             res.end(`Hii ${name}, This is a home page`);
//             break;
//         case "/about":
//             res.end("The is about page");
//             break;
//         case "/contact":
//             res.end(`hii ${name}, This is a contact page.`)
//             break;
//         default:
//             res.end("404 not found");
//             break;
//     }
// })

// const server=http.createServer(app);

// server.listen(8000,()=>{console.log("server started")});