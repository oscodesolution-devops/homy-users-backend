import express from "express";
import routerV1 from "./v1/index.js";
import controllers from "../controllers/index.js";
import { isLoggedIn } from "../middlewares/authorization.js";
import multer from "multer";
import {
  deleteImage,
  getGalleryImages,
  getRecentImages,
  uploadImage,
} from "../controllers/gallery.controller.js";
import client from "../config/contentful.config.js";
import Chef from "../models/chef.model.js";
import { handleImageUpload } from "../middlewares/cloudinaryUpload.js";

const router = express.Router();
const formatImageUrl = (url) => `https:${url}`;
async function fetchBlogs() {
  try {
    const entries = await client.getEntries({
      content_type: "healthyFoodBlog", // Replace with your content type ID
    });
    console.log(entries.items)
    return entries.items.map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      role: item.fields.role,
      author: item.fields.author,
      description: item.fields.description,
      slug: item.fields.slug,
      body: item.fields.body,
      image: formatImageUrl(item.fields.image?.fields?.file?.url),
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
}

const upload = multer({ dest: "uploads/" });

router.post("/api/v1/upload", upload.single("image"), uploadImage);
router.get("/api/v1/images", getGalleryImages);
router.delete("/api/v1/images/:id", deleteImage);
router.get("/api/v1/recent-images", getRecentImages);

router.get("/api/v1/blogs", async (req, res) => {
  try {
    const blogs = await fetchBlogs();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

router.get("/api/v1/blogs/:id", async (req, res) => {
    const { id } = req.params; // Extract blog ID from the request parameters
  
    try {
      // Fetch the blog from Contentful by its ID with specific fields
      const entry = await client.getEntry(id);
  
      // If the blog entry is not found, return a 404
      if (!entry) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      // Prepare the data for the response, only including the relevant fields
      const blogData = {
        title: entry.fields.title,
        author: entry.fields.author,
        role: entry.fields.role,
        description: entry.fields.description,
        image: entry.fields.image ? formatImageUrl(entry.fields.image.fields.file.url) : null, // Assuming the image has a file URL
        body: entry.fields.body // Include the body content if necessary
      };
  
      // Return the blog data as the response
      res.status(200).json(blogData);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  });

router.get("/api/v1/chef/images",async(req,res)=>{
  try{
    const chefs = await Chef.find().select("profilePicture name cuisines")
    res.json(chefs);
  }catch(error){
    console.error("Error fetching chefs profile", error);
      res.status(500).json({ message: "Server error. Please try again later." });
  }
})
  

router.use("/api/v1", routerV1);

router.use("/api/v1/upload-images", handleImageUpload);

router.get(
  "/banner",
  isLoggedIn,
  controllers.applicationController.getApplication
);

export default router;
