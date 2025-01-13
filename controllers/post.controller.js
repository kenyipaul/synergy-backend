const fs = require("fs")
const multer = require("multer")
const postRouter = require("express").Router();
const postModel = require("../models/post.model");
const postInfoModel = require("../models/post.info.model")
const userModel = require("../models/user.model");
const userInfo = require("../models/user.info.model")

const upload = multer({ dest: "assets/post_images" })

postRouter.post("/api/post/", upload.single("post_image"), (req, res) => {

    const { admin_id, post_title, post_body, post_image, community_id } = req.body;
    const image_name = post_image ? `${community_id}_${admin_id}_${new Date().getTime()}.png` : "";

    if (post_image) {
        const buffer = Buffer.from(post_image.split(",")[1], "base64")
        fs.writeFile(`assets/post_images/${image_name}`, buffer, "base64", (er, da) => {
            console.log(er, da)
        })
    }

    postModel.create({ 
        admin_id, post_title, post_body, post_image: post_image ? `assets/post_images/${image_name}` : "", comm_id: community_id
    }).then((response) => {
        console.log(response)
        res.send({accepted: true, msg: "Post uploaded successfully"})
    })

})




postRouter.post("/api/posts/", (req, res) => {

    const community_id = req.body.id;

    postModel.find({ comm_id: community_id }).then((posts) => {
        let promises = posts.map((data) => {
            return userModel.findOne({_id: data.admin_id}).then((user) => {
               return {
                    _id: data._id,
                    admin_id: user.id,
                    admin_name: user.username,
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
            let promises = data.map((post) => {    
                return userInfo.findOne({ user_id: post.admin_id }).then((info) => {
                    return {
                        _id: post._id,
                        admin_id: post.admin_id,
                        admin_name: post.admin_name,
                        admin_image: info.image,
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

            Promise.all(promises).then((posts) => {
                res.send(posts)
            })
        })

    })
    
})



postRouter.get("/api/post/:id", (req, res) => {

    const tmp = req.originalUrl.split("/")
    const post_id = tmp[tmp.length - 1]

    postModel.findOne({_id: post_id}).then((post) => {

        userModel.findOne({_id: post.admin_id}).then((user) => {

            let post_data = {
                _id: post._id,
                admin_name: user.username,
                post_title: post.post_title,
                post_body: post.post_body,
                post_image: post.post_image,
                post_date: post.post_date,
                post_likes: post.post_likes,
                post_comments: post.post_comments,
                post_replies: post.post_replies,
            }

            res.send(post_data)

        })

    })
 
})


postRouter.post("/api/post/like", (req, res) => {

    const {postId, community_id, user_id} = req.body;

    postModel.updateOne({_id: postId}, {$push: { post_likes: user_id }}).then((response) => {
        postModel.find({ _id: postId }).then((post) => {

            let promises = post.map((data) => {
                return userModel.findOne({_id: data.admin_id}).then((user) => {
                   return {
                        _id: data._id,
                        admin_name: user.username,
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
                return res.send(data[0])
            })
    
        })
    })
})

postRouter.post("/api/post/dislike", (req, res) => {

    const {postId, community_id, user_id} = req.body;

    postModel.updateOne({_id: postId}, {$pull: { post_likes: user_id }}).then((response) => {
        postModel.find({ _id: postId }).then((post) => {

            let promises = post.map((data) => {
                return userModel.findOne({_id: data.admin_id}).then((user) => {
                   return {
                        _id: data._id,
                        admin_name: user.username,
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
                return res.send(data[0])
            })
    
        })
    })
})

module.exports = postRouter 