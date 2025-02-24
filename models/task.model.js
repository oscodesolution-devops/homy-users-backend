import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ongoing', 'future', 'completed'],
    default: 'future'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;