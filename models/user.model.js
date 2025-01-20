const mongoose = require('mongoose')

const User = mongoose.model("users", mongoose.Schema({
    username: { type: "string", required: true, unique: true },
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    email: { type: "string", required: true, unique: true },
    password: { type: "string", required: true },
    dob: { type: "string", default: null },
    image: { type: "string", default: null },
    cover: { type: "string", default: null },
    bio: { type: "string", default: null },
    resetCode: { type: "string", default: null }
}))

module.exports = User;