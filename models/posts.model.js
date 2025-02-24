import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    postBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    postImage: {
        type: String, // URL to post image
        required: true
    },
    postDescription: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
}, {
    timestamps: true
});

// Add index for better query performance
postSchema.index({ postBy: 1, createdAt: -1 });

// Method to check if a user has liked the post
postSchema.methods.isLikedByUser = function(userId) {
    return this.likes.includes(userId);
};

// Virtual field for likes count
postSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

const Post = mongoose.model('Post', postSchema);

export default Post;