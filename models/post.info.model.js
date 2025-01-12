const mongoose = require('mongoose');

const postInfoModel = mongoose.model("post_info", mongoose.Schema({
    post_id: { type: "string", required: true },
    post_likes: { type: "string", default: 0 },
    post_comments: { type: "string", default: 0 },
}))

module.exports = postInfoModel