import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { clearAuthCookie, readAuthCookie } from "../utils/authCookie.js";

// Protected browser sessions are authenticated only by the HttpOnly cookie.
export const protect = async (req, res, next) => {
    try {
        const token = readAuthCookie(req.headers.cookie);
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            clearAuthCookie(res);
            return res.status(401).json({ message: "Not authorized, user no longer exists" });
        }

        if(req.user.isBlocked){
            clearAuthCookie(res);
            return res.status(403).json({ success:false ,message: "Your account is blocked. Please contact support." });
        }

        next();
    } catch(error){
        clearAuthCookie(res);
        if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
            console.error("Error in protect middleware:", error);
        }
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// Role based access control middleware
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied , You are not authorized to access this route` });
        }
        next();
    };
};
