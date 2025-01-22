const mongoose = require("mongoose")

const EventModel = mongoose.model("events", mongoose.Schema({
    admin: { type: "string", required: true },
    title: { type: "string", required: true },
    date: { type: "string", required: true },
    description: { type: "string", required: true },
    poster: { type: "string", default: null },
    location: { type: "string", default: null },
    category: { type: "string", required: true },
    website: { type: "string", default: null },
    contact: { type: "string", default: null },
    tags: { type: "array", default: [] },
    dateCreated: { type: "string", default: Date.now }
}))

module.exports = EventModel