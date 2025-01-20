const fs = require("fs")
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const CommunityModel = require("../models/community.model")

module.exports = (socket) => {

    // CREATE POST 

    socket.on("/create/post", data => {
        const { admin_id, post_title, post_body, post_image, community_id } = data;
       
        const image_name = post_image ? `${community_id}_${admin_id}_${new Date().getTime()}.png` : "";

        if (post_image) {
            const buffer = Buffer.from(post_image.split(",")[1], "base64")
            fs.writeFile(`assets/post_images/${image_name}`, buffer, "base64", (er, da) => {
            })
        }

        postModel.create({ 
            admin_id, post_title, post_body, post_image: post_image ? `assets/post_images/${image_name}` : "", comm_id: community_id
        }).then((response) => {
            CommunityModel.findOne({_id: community_id}).then((community) => {
                CommunityModel.findOneAndUpdate({_id: community_id}, { $set: { community_topics: community.community_topics + 1 } }).then(() => {});
            })

            socket.emit("/create/post/response", {error: false, msg: "Post uploaded successfully"})
        }).catch((e) => {
            console.log(e)
            socket.emit("/create/post/response", {error: true, msg: "Failed to upload post"})
        })
    })
    

    // FETCH POSTS 

    socket.on("/fetch/posts", id => {
        postModel.find({ comm_id: id }).then((posts) => {
            let promises = posts.map((data) => {
                return userModel.findOne({_id: data.admin_id}).then((user) => {
                   return {
                        _id: data._id,
                        admin_id: user.id,
                        admin_name: user.username,
                        admin_image: user.image,
                        post_title: data.post_title,
                        post_body: data.post_body,
                        post_image: data.post_image,
                        post_date: data.post_date,
                        post_likes: data.post_likes,
                        post_comments: data.post_comments,
                        post_replies: data.post_replies,
                   }
                })
            })
    
    
            Promise.all(promises).then((data) => {
                socket.emit("/fetch/posts/response", { error: false, data })
            })
            
        }).catch(() => {
            socket.emit("/fetch/posts/response", { error: true, msg: "Failed to fetch posts" })
        })
    })



}