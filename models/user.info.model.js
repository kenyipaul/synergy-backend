const mongoose = require('mongoose')

const UserInfo = mongoose.model("user_info", mongoose.Schema({
    user_id: { type: "string", required: true, unique: true },
    dob: { type: "string", default: null },
    image: { type: "string", default: null },
    cover: { type: "string", default: null },
    bio: { type: "string", default: null },
}))

module.exports = UserInfo;