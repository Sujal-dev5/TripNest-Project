const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res) => {
 res.render("users/signup.ejs")
}; // 

module.exports.signUp = async(req,res,next) => {
    try{
    let{username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err) {
          return next(err);
        }
        req.flash("success", "Welcome to TripNest");
        res.redirect("/listings"); 
    });
    } catch(e) {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
 res.render("users/login.ejs")
}; //

module.exports.login = async (req,res) => {
req.flash("success","Welcome back to tripNest!");
let redirectUrl = res.locals.redirectUrl || "/listings";
res.redirect(redirectUrl);
}; //

module.exports.logout =   (req,res,next) => {
    req.logout((err) => {
        if(err) {
          return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
}; //

module.exports.renderForgotPasswordForm = (req, res) => {
    res.render("users/forgot.ejs");
};

module.exports.resetPassword = async (req, res) => {
    try {
        let { username, email, newPassword, confirmPassword } = req.body;
        if (!username || !email || !newPassword || !confirmPassword) {
            req.flash("error", "All fields are required.");
            return res.redirect("/forgot-password");
        }
        if (newPassword !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/forgot-password");
        }
        const user = await User.findOne({
            username: username.trim(),
            email: { $regex: new RegExp("^" + email.trim() + "$", "i") },
        });
        if (!user) {
            req.flash("error", "No user found with the provided username and email.");
            return res.redirect("/forgot-password");
        }
        await user.setPassword(newPassword);
        await user.save();
        req.flash("success", "Password has been reset successfully! Please log in with your new password.");
        res.redirect("/login");
    } catch (err) {
        req.flash("error", err.message || "Failed to reset password.");
        res.redirect("/forgot-password");
    }
};