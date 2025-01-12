const mongoose = require('mongoose')

const User = mongoose.model("users", mongoose.Schema({
    username: { type: "string", required: true, unique: true },
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    email: { type: "string", required: true, unique: true },
    password: { type: "string", required: true },
    verified: { type: "boolean", default: false },
}))

module.exports = User;