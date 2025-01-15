const mongoose = require("mongoose")

const postModel = mongoose.model("posts", mongoose.Schema({
    comm_id: { type: "string", required: true },
    admin_id: { type: "string", required: true },
    post_title: { type: "string", required: true },
    post_body: { type: "string", default: null },
    post_image: { type: "string", default: null },
    post_likes: { type: "array", default: []  },
    post_replies: [{
        userId: { type: "string", required: true },
        userName: { type: "string", required: true },
        userImage: { type: "string", required: true },
        postId: { type: "string", required: true },
        commentId: { type: "string", required: true },
        reply: { type: "string", required: true },
        date: { type: "date", default: Date.now() }
    }],
    post_comments: [{
        userId: { type: "string", required: true },
        userName: { type: "string", required: true },
        userImage: { type: "string", required: true },
        postId: { type: "string", required: true },
        comment: { type: "string", required: true },
        date: { type: "date", default: Date.now() }
    }],
    post_date: { type: "date", default: Date.now },
}, { timestamps: true }))

module.exports = postModel;