const mongoose = require("mongoose")

const postModel = mongoose.model("posts", mongoose.Schema({
    comm_id: { type: "string", required: true },
    admin_id: { type: "string", required: true },
    post_title: { type: "string", required: true },
    post_body: { type: "string", default: null },
    post_image: { type: "string", default: null },
    post_likes: { type: "array", default: []  },
    post_comments: { type: "array", default: [] },
    post_replies: { type: "array", default: [] },
    post_date: { type: "date", default: Date.now },
}))

module.exports = postModel;