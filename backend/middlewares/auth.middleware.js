
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to protect routes
export const protect = async (req, res, next) => {
    try{
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if(req.user && req.user.isBlocked){
            return res.status(403).json({ success:false ,message: "Your account is blocked. Please contact support." });
        }

        next(); 

    }catch(error){
        console.error("Error in protect middleware:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }   
};


//  role based access control middleware
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied , You are not authorized to access this route` });
        }
        next();
    };
};

