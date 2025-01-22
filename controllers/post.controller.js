const fs = require("fs")
const multer = require("multer")
const userModel = require("../models/user.model")
const postRouter = require("express").Router();
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const upload = multer({ dest: "assets/post_images" })
const CommunityModel = require("../models/community.model");

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
        CommunityModel.findOne({_id: community_id}).then((community) => {
            CommunityModel.findOneAndUpdate({_id: community_id}, { $set: { community_topics: community.community_topics + 1 } }).then(() => {

            });
        })

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
            res.send(data)
        })

    })
    
})



postRouter.get("/api/post/:id", (req, res) => {

    const post_id = req.params.id

    postModel.findOne({_id: post_id}).then((post) => {

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
                return res.send(data[0])
            })
    
        })
    })
})



postRouter.post("/api/post/comment", (req, res) => {

    const { userId, postId, comment, date } = req.body;

    
    userModel.findOne({ _id: userId }).then((user) => {
        const newComment = {userId, userImage: user.image, userName: user.username, postId, comment, date}
        
        postModel.findOneAndUpdate({ _id: postId }, { $push: { post_comments: newComment  } }).then((response) => {
            postModel.findOne({_id: postId}).then((response) => {

                const comment = response.post_comments[response.post_comments.length - 1]
                res.send(comment)
                
            })
        })
    })


    // commentModel.create({userId, postId, comment}).then((response) => {
    //     if (response) {            
    //         userModel.findOne({_id: response.userId}).then((user) => {
    //             const comment = {
    //                 id: response._id,
    //                 userId: response.userId,
    //                 userName: user.username,
    //                 userImage: user.image,
    //                 comment: response.comment, 
    //                 date: response.createdAt
    //             }

    //             res.send({ accepted: true, data: comment })
    //         })
    //     }
    // }).catch((err) => {
    //     console.error(err)
    // })

})


postRouter.get("/api/post/comment/:id", (req, res) => {

    const postId = req.params.id

    commentModel.find({ postId }).then((comments) => {
        let promises = comments.map((comment) => {
            return userModel.findOne({_id: comment.userId}).then((user) => {
                return {
                    id: comment._id,
                    userId: comment.userId,
                    userName: user.username,
                    userImage: user.image,
                    comment: comment.comment,
                    date: comment.date
                }
            })
        })

        Promise.all(promises).then((data) => {
            res.send(data)
        })
    })

})


postRouter.post("/api/post/reply", (req, res) => {

    const { postId, userId, reply, commId, date } = req.body;

    userModel.findOne({ _id: userId }).then((user) => {

        const replyObj = {
            userId,
            userImage: user.image,
            userName: user.username,
            commentId: commId,
            postId,
            reply,
            date
        }

        postModel.findOneAndUpdate({ _id: postId }, { $push: { post_replies: replyObj } }).then((post) => {
            postModel.findOne({_id: postId }).then((response) => {
                const reply = response.post_replies[response.post_replies.length - 1]
                res.send(reply)
            })
        })

    })


})



module.exports = postRouter 