import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide a user ID"]
    },
    mealSchedule: {
        breakfast: {
            type: String,
        },
        lunch: {
            type: String,
        },
        dinner: {
            type: String,
        }
    },
    date: {
        type: Date,
        required: [true, "Please provide a date"],
        default: Date.now
    }
}, {
    timestamps: true
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema, "mealPlan");

export default MealPlan;
