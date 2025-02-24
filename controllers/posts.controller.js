import { sendSuccessApiResponse } from "../middlewares/successApiResponse.js";
import db from "../models/index.js";

// Get all posts with pagination
const getAllPosts = async (req, res, next) => {
    try {
        console.log(req.user)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await db.Post.find({})
            .populate('postBy', 'firstName')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
        console.log(posts)
        const total = await db.Post.countDocuments();

        const response = sendSuccessApiResponse(
            "Posts fetched successfully",
            {
                posts,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total
            },
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

// Get single post by ID
const getPostById = async (req, res, next) => {
    try {
        const post = await db.Post.findById(req.params.id)
            .populate('postBy', 'name')
        if (!post) {
            return res.status(404).send({
                success: false,
                message: "Post not found"
            });
        }

        const response = sendSuccessApiResponse(
            "Post fetched successfully",
            post,
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

// Create new post
const createPost = async (req, res, next) => {
    try {
        const { postImage, postDescription } = req.body;
        const userId = req.user._id; // Assuming user ID is available from auth middleware

        const post = new db.Post({
            postBy: userId,
            postImage,
            postDescription
        });

        await post.save();

        const populatedPost = await post.populate('postBy', 'name');

        const response = sendSuccessApiResponse(
            "Post created successfully",
            populatedPost,
            201
        );

        return res.status(201).send(response);
    } catch (error) {
        next(error);
    }
};

// Update post
const updatePost = async (req, res, next) => {
    try {
        const { postImage, postDescription } = req.body;
        const postId = req.params.id;
        const userId = req.user._id; // Assuming user ID is available from auth middleware

        const post = await db.Post.findOne({ _id: postId, postBy: userId });

        if (!post) {
            return res.status(404).send({
                success: false,
                message: "Post not found or unauthorized"
            });
        }

        post.postImage = postImage || post.postImage;
        post.postDescription = postDescription || post.postDescription;

        await post.save();

        const response = sendSuccessApiResponse(
            "Post updated successfully",
            post,
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

// Delete post
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id; // Assuming user ID is available from auth middleware

        const post = await db.Post.findOneAndDelete({ _id: postId, postBy: userId });

        if (!post) {
            return res.status(404).send({
                success: false,
                message: "Post not found or unauthorized"
            });
        }

        const response = sendSuccessApiResponse(
            "Post deleted successfully",
            post,
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

// Like/Unlike post
const toggleLike = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id; // Assuming user ID is available from auth middleware

        const post = await db.Post.findById(postId);

        if (!post) {
            return res.status(404).send({
                success: false,
                message: "Post not found"
            });
        }

        const isLiked = post.isLikedByUser(userId);

        if (isLiked) {
            // Unlike the post
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like the post
            post.likes.push(userId);
        }

        await post.save();

        const populatedPost = await post.populate('postBy likes', 'fullName');

        const response = sendSuccessApiResponse(
            `Post ${isLiked ? 'unliked' : 'liked'} successfully`,
            populatedPost,
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

// Get user's posts
const getUserPosts = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await db.Post.find({ postBy: userId })
            .populate('postBy', 'name email image')
            .populate('likes', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await db.Post.countDocuments({ postBy: userId });

        const response = sendSuccessApiResponse(
            "User posts fetched successfully",
            {
                posts,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total
            },
            200
        );

        return res.status(200).send(response);
    } catch (error) {
        next(error);
    }
};

const postController = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    getUserPosts
};

export default postController;