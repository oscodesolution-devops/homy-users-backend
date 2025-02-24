import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    banner:{
        type: [String],
    }
})

const Application = mongoose.model("Application",applicationSchema,"application");

export default Application;