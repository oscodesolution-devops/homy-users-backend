import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true
  }
);

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;