const CommunityModel = require("../models/community.model")
const postModel = require("../models/post.model")

module.exports = (socket) => {

    socket.on("/fetch/community", id => {
        CommunityModel.findOne({ _id: id }).then((response) => {        
            socket.emit("/fetch/community/response", { error: false, data: response })
        }).catch(() => {
            socket.emit("/fetch/community/response", { error: true, msg: "Failed to fetch community data" })
        })
    })

    socket.on("/fetch/communities", () => {
        CommunityModel.find().then((communities) => {
            let promise = communities.map((data) => {
                return postModel.find({comm_id: data._id}).then((response) => {
                    let da = {
                        _id: data._id,
                        community_admin: data.community_admin,
                        community_name: data.community_name,
                        community_topic: data.community_topic,
                        community_description: data.community_description,
                        community_icon: data.community_icon,
                        community_banner: data.community_banner,
                        community_access: data.community_access,
                        community_maturity: data.community_maturity,
                        community_members: data.community_members,
                        community_date: data.community_date,
                        community_topics: response.length
                    }

                    return da
                })
            })

            Promise.all(promise).then((data) => {
                socket.emit("/fetch/communities/response", { error: false, data})
            })

        }).catch((error) => {
            console.log(error)
            socket.emit("/fetch/communities/response", { error: true, msg: "Failed to fetch communities" })
        })
    })


    socket.on("/join/community", data => {
        CommunityModel.updateOne({ _id: data.community_id }, { $push: { community_members: data.user_id } }).then(() => {

            CommunityModel.findOne({_id: data.community_id}).then((response) => {
                socket.emit("/join/community/response", {error: false, data: response})
            }).catch((error) => {
                socket.emit("/join/community/response", {error: true, msg: "Failed to update community"})
            })
            
        }).catch((error) => {
            socket.emit("/join/community/response", {error: true, msg: "Failed to update community"})
        })
    })


    socket.on("/leave/community", data => {
        CommunityModel.updateOne({ _id: data.community_id }, { $pull: { community_members: data.user_id } }).then((response) => {
            socket.emit("/leave/community/response", {error: false, msg: "You have successfully left this community" })
        }).catch((err) => {
            socket.emit("/leave/community/response", {error: false, msg: "An error happened during operation" })
        })
    })


}