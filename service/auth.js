// const sessionIdToUserMap=new Map(); // no need to maintain the state because we are using stateless authentication....
const secret="VISHAL!@#SINGH12312"
const jwt = require("jsonwebtoken");
function setUser(user){
    // sessionIdToUserMap.set(id,user) 
    //below Stateless authentication.......
    const payload={
        _id:user._id,
        email:user.email,
        name:user.name,
    };
    return jwt.sign(payload,secret,{expiresIn:"1h"});
}

// function getUser(id){
//     return sessionIdToUserMap.get(id);
// }
function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        console.error("Invalid token:", err.message);
        return null;
    }
}


module.exports={
    setUser,
    getUser
}