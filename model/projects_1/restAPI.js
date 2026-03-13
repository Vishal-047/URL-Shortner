const express=require("express");
const app=express();
const PORT=8001;
const fs=require("fs");

const user=require('./MOCK_DATA.json');
//Integrating Middleware -> Plugin....
// app.use(express.json()); //for json data...
app.use(express.urlencoded({extended:false}));

//Let's insert 2 more Middle ware :  its role as a functional bridge between a client's request and the server's final response

app.use((req,res,next)=>{
    console.log("Hello from middleware 1");

    fs.appendFile("api_log.txt", `\n${Date.now()}, ${req.method}, ${req.path}`,(err)=>{
        if(err){
            console.log("Error in appending the log file",err);
        }
    });
    next(); // Here if didn't call next function/middleware then it will endup the response here only and no further function will execute;
})

app.use((req,res,next)=>{
    console.log("Hello from middleware 2");
    // return console.log("hey"); // No further execution is possible because in middleware 2 we are returning...
    // return res.end("hey"); //Same no further execution is possible...
    next(); //express will automatically detect the next function which needs to be executed...
})

//for mobile view
app.get("/user",(req,res)=>{
    const html=`
    <ul>
    ${user.map((user=>`<li>${user.first_name}</li><li>${user.email}</li>`)).join("")}
    </ul>`
    return res.send(html);
})
app.get("/api/user",(req,res)=>{
    return res.json(user);
})
app.route("/api/user/:id")//:id->Dynamic (variable)
    .get((req,res)=>{ 
    const id=Number(req.params.id);
    const users=user.find((user)=>user.id==id);
    if(!users){
        return res.status(404).json({status:`Unable to find the user with id ${id}`});
    }
    return res.json(users);})
    //PATCH request.....
    .patch((req,res)=>{
        const id=Number(req.params.id);
        const index=user.findIndex(u=>u.id==id);
        if(!index){
            return res.status(404).json({status: "Faliled to find the user"});
        }
        user[index]={...user[index],...req.body};
        fs.writeFile("./MOCK_DATA.json",JSON.stringify(user,null,2),(err,data)=>{
        if(err){
            return res.status(500).json({status: "Failed to update the data"});
        }
        return res.status.apply(201).json({status:"success", user:user[index]});
    })
})
    //DELETE request......
    .delete((req,res)=>{
    const id=Number(req.params.id);
    const index=user.findIndex(u=>u.id==id);
    if(!index){
        return res.status(404).json({status:"Failed to find the user"});
    }
    const deleteuser=user.splice(index,1);
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(user,null,2),(err)=>{
        if(err){
            return res.status(404).json({status:"Failed to delete the user"});
        }
        return res.status(200).json({status:"Successfully deleted the user", user:deleteuser});
    })
})

app.post("/api/user",(req,res)=>{
    const body=req.body;
    console.log(body);
    if(!body.first_name || !body.last_name || !body.gender || !body.email){
        return res.status(400).json({status:"All field must required"});
    }
    const newuser={
        id:user[user.length-1].id+1,
        ...body
    }
    user.push(newuser);
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(user),(err,data)=>{
        if(err){
            return res.status(500).json({status: "Failed to push the data"});
        }
        return res.status(201).json({status:"success", user:newuser});
    })
})
// app.patch("/api/user/:id",(req,res)=>{
//     //TODO: edit the user
//     return res.json({status:"pending"});
// })
// app.delete("/api/user/:id",(req,res)=>{
//     //TODO: delete the user
//     return res.json({status:"pending"});
// })  we may merge these 


app.listen(PORT,()=>console.log(`Server started at port ${PORT}`));