const mongoose = require("mongoose")

const postModel = mongoose.model("posts", mongoose.Schema({
    admin_id: { type: "string", required: true },
    community_id: { type: "string", required: true },
    post_title: { type: "string", required: true },
    post_body: { type: "string", default: null },
    post_image: { type: "string", default: null },
    post_date: { type: "date", default: Date.now }
}))

module.exports = postModel;