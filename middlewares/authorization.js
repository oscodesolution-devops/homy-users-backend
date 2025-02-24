import db from "../models/index.js";
import jwt from "jsonwebtoken"

export const isLoggedIn = async(req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer ","").trim();
    console.log(token)
    if(!token){
        return res.status(401).json({
            success:"false",
            message: "Login First to access this page",
        })
    }
    console.log(process.env.JWT_SECRET)

    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await db.User.findOne({_id: decode.userId});
        return next();
    }catch(error){
        console.log(error)
        return res.status(401).json({
            success:"false",
            message: "Login First to access this page",
        })
    }
}

export const hasAdminAccess = async (req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer ","").trim();
    console.log(token)
    if(!token){
        return res.status(401).json({
            success:"false",
            message: "Login First to access this page",
        })
    }
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await db.Admin.findOne({_id: decode.userId});
        
        return next();
    }catch(error){
        console.log(error)
        return res.status(401).json({
            success:"false",
            message: "Login First to access this page",
        })
    } 
}