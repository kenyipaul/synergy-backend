const mongoose = require('mongoose')

const CommunityModel = mongoose.model("communities", mongoose.Schema({
    community_admin: { type: "string", required: true },
    community_name: { type: "string", required: true, unique: true },
    community_topic: { type: "string", required: true },
    community_description: { type: "string", required: true },
    community_icon: { type: "string", default: null },
    community_banner: { type: "string", default: null },
    community_access: { type: "string", required: false },
    community_maturity: { type: "string", default: null },
    community_members: { type: "array", default: [] },
    community_date: { type: "date", default: Date.now }
}))

module.exports = CommunityModel;