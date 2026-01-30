const user=require('../model/user');


async function handleuser(req,res) {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.render("signup",{error:"All fields are required"});
        }
        await user.create({
            name,
            email,
            password
        });
        return res.redirect("/login");
    } catch (error) {
        console.error("Error creating user:", error);
        if(error.code === 11000){
            return res.render("signup",{error:"Email already exists. Please use a different email."});
        }
        return res.render("signup",{error:"An error occurred. Please try again."});
    }
}
async function handlelogin(req,res) {
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.render("login",{error:"Email and password are required"});
        }
        const exuser=await user.findOne({email});
        if(!exuser){
            return res.render("login",{error:"User not found. Please signup first."});
        }
        if(exuser.password !== password){
            return res.render("login",{error:"Incorrect password"});
        }
        return res.redirect("/");
    } catch (error) {
        console.error("Error in finding user:", error);
        return res.render("login",{error:"An error occurred. Please try again."});
    }
    
}

module.exports={handleuser,handlelogin};