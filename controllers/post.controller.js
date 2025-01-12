const fs = require("fs")
const multer = require("multer")
const postRouter = require("express").Router();
const postModel = require("../models/post.model");
const postInfoModel = require("../models/post.info.model")
const userModel = require("../models/user.model");
const userInfoModel = require("../models/user.info.model");
const User = require("../models/user.model");

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
        admin_id, post_title, post_body, post_image: post_image ? `assets/post_images/${image_name}` : "", community_id
    }).then((response) => {
        postInfoModel.create({ post_id: response._id }).then((data) => {
            console.log(data)
        })
        res.send({accepted: true, msg: "Post uploaded successfully"})
    })

})

postRouter.post("/api/posts/", (req, res) => {

    const community_id = req.body.id;

    postModel.find({ community_id: community_id }).then((posts) => {

        let promises = posts.map((data) => {
            return userModel.findOne({_id: data.admin_id}).then((user) => {
               return {
                    _id: data._id,
                    admin_name: user.username,
                    post_title: data.post_title,
                    post_body: data.post_body,
                    post_image: data.post_image,
                    post_date: data.post_date
               }
            })
        })

        Promise.all(promises).then((data) => {
            return res.send(data)
        })

    })
    
})

postRouter.get("/api/post/:id", (req, res) => {

    const tmp = req.originalUrl.split("/")
    const post_id = tmp[tmp.length - 1]

    postModel.findOne({_id: post_id}).then((post) => {

        userModel.findOne({_id: post.admin_id}).then((user) => {
            userInfoModel.findOne({user_id: post.admin_id}).then((info) => {
                
                let post_data = {
                    _id: post._id,
                    admin_name: user.username,
                    post_title: post.post_title,
                    post_body: post.post_body,
                    post_image: post.post_image,
                    post_date: post.post_date
                }

                res.send(post_data)
            })
        })

    })

})

module.exports = postRouter 