import express from "express";
const router = express.Router();

// import controllers
import { isLoggedIn } from "../../middlewares/authorization.js";
import controllers from "../../controllers/index.js";
import { uploadFiles } from "../../middlewares/upload.js";
import { handleFileUploadErrors } from "../../middlewares/upload.js";

// Route to get all posts with pagination
router.route("/")
    .get(isLoggedIn,controllers.postController.getAllPosts)
    .post(isLoggedIn, controllers.postController.createPost);

// Route to get posts of a specific user
router.route("/user/:userId?")
    .get(isLoggedIn, controllers.postController.getUserPosts);

// Routes for specific post operations
router.route("/:id")
    .get(controllers.postController.getPostById)
    .put(isLoggedIn, controllers.postController.updatePost)
    .delete(isLoggedIn, controllers.postController.deletePost);

// Route for liking/unliking a post
router.route("/:id/toggle-like")
    .post(isLoggedIn, controllers.postController.toggleLike);

router.route("/createPostByAdmin")
    .post(isLoggedIn,uploadFiles,handleFileUploadErrors, controllers.postController.createPostByAdmin);

export default router;