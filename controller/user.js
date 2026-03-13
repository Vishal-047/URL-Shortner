
const { v4: uuidv4 } = require("uuid");
const user = require('../model/user');
const { setUser } = require("../service/auth");


async function handleuser(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render("signup", { error: "All fields are required" });
        }
        await user.create({
            name,
            email,
            password
        });
        return res.redirect("/login");
    } catch (error) {
        console.error("Error creating user:", error);
        if (error.code === 11000) {
            return res.render("signup", { error: "Email already exists. Please use a different email." });
        }
        return res.render("signup", { error: "An error occurred. Please try again." });
    }
}
async function handlelogin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render("login", { error: "Email and password are required" });
        }
        const exuser = await user.findOne({ email });
        if (!exuser) {
            return res.render("login", { error: "User not found. Please signup first." });
        }
        if (exuser.password !== password) {
            return res.render("login", { error: "Incorrect password" });
        }
        // const sessionId=uuidv4();  //no need 
        // Convert Mongoose document to plain object
        const userObject = exuser.toObject ? exuser.toObject() : exuser;
        // setUser(sessionId,userObject);
        const token = setUser(exuser);
        // res.cookie("uid",sessionId, {
        res.cookie("uid", token, {
            httpOnly: true,
            secure: true,          // was false — this is the bug
            sameSite: "lax",       // add this too
            maxAge: 1000 * 60 * 60 * 24
        }); 
        return res.redirect(302, "/");

    } catch (error) {
        console.error("Error in finding user:", error);
        return res.render("login", { error: "An error occurred. Please try again." });
    }

}

async function handlelogout(req, res) {
    res.clearCookie("uid");
    return res.redirect("/login");
}

async function handleDeleteAccount(req, res) {
    try {
        const userId = req.user._id;
        const URL = require('../model/url');

        // Delete all URLs created by this user
        await URL.deleteMany({ createdBy: userId });

        // Delete the user account
        await user.findByIdAndDelete(userId);

        // Clear auth cookie and redirect to login
        res.clearCookie("uid");
        return res.redirect("/login");
    } catch (error) {
        console.error("Error deleting account:", error);
        return res.redirect(302,"/");
    }
}

module.exports = { handleuser, handlelogin, handlelogout, handleDeleteAccount };