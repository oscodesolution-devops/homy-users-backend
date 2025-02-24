import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please provide a title"]
    },
    description:{
        type:String,
        required:[true,"Please provide a description"]
    }
},{
    timestamps:true,
})

const Notifications = mongoose.model("Notification",notificationSchema,"notification");

export default Notifications;