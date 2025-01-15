const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    userId: { type: "string", required: true },
    postId: { type: "string", required: true },
    comment: { type: "string", required: true },
    date: { type: "date", default: Date.now() }
}, { timestamps: true })

const commentModel = mongoose.model("comments", commentSchema)

module.exports = commentModel