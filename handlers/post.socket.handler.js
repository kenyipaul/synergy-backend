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

            let promises = posts.map(data => {
                return userModel.findOne({ _id: data.admin_id }).then(user => {
                    if (user) {
                        return {
                            id: data._id,
                            admin_id: data.admin_id,
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
                    }
                })
            })

            Promise.all(promises).then((data) => {
                socket.emit("/fetch/posts/response", { error: false, data })
            })

        }).catch((err) => {
            console.log(err)
            socket.emit("/fetch/posts/response", { error: true, msg: "Failed to fetch posts" })
        })
    })



    // FETCH POST

    socket.on("/fetch/post", id => {
        postModel.findOne({_id: id}).then((post) => {

            userModel.findOne({_id: post.admin_id}).then((user) => {

                let post_data = {
                    _id: post._id,
                    admin_name: user.username,
                    admin_image: user.image,
                    post_title: post.post_title,
                    post_body: post.post_body,
                    post_image: post.post_image,
                    post_date: post.post_date,
                    post_likes: post.post_likes,
                    post_comments: post.post_comments,
                    post_replies: post.post_replies,
                }

                socket.emit("/fetch/post/response", { error: false, data: post_data })

            })

        })
    })



    // LIKE POST

    socket.on("/like/post", data => {

        postModel.updateOne({_id: data.postId}, {$push: { post_likes: data.userId }}).then((response) => {
            postModel.find({ _id: data.postId }).then((posts) => {
    
                let promises = posts.map((post) => {
                    return userModel.findOne({_id: post.admin_id}).then((user) => {
                        return {
                            _id: post._id,
                            admin_name: user.username,
                            admin_image: user.image,
                            post_title: post.post_title,
                            post_body: post.post_body,
                            post_image: post.post_image,
                            post_date: post.post_date,
                            post_likes: post.post_likes,
                            post_comments: post.post_comments,
                            post_replies: post.post_replies,
                        }
                    })
                })
        
                Promise.all(promises).then((data) => {
                    return socket.emit("/like/post/response", {error: false, data: data[0]})
                })
        
            })
        })
    })


    // dislike

    socket.on("/dislike/post", data => {

        postModel.updateOne({_id: data.postId}, {$pull: { post_likes: data.userId }}).then(() => {
            postModel.find({ _id: data.postId }).then((posts) => {

                let promises = posts.map((post) => {
                    return userModel.findOne({_id: post.admin_id}).then((user) => {
                        return {
                                _id: post._id,
                                admin_name: user.username,
                                admin_image: user.image,
                                post_title: post.post_title,
                                post_body: post.post_body,
                                post_image: post.post_image,
                                post_date: post.post_date,
                                post_likes: post.post_likes,
                                post_comments: post.post_comments,
                                post_replies: post.post_replies,
                        }
                    })
                })
        
                Promise.all(promises).then((data) => {
                    return socket.emit("/dislike/post/response", {error: false, data: data[0]})
                })
        
            })
        })

    })

}