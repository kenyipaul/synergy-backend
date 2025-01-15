const fs = require("fs")
const sharp = require("sharp")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const communityRouter = require('express').Router();
const CommunityModel = require("../models/community.model");

const upload = multer({ dest: "assets/community_images/" })

communityRouter.post("/api/community/create", upload.any(),  (req, res) => {

    const token = req.headers.authorization.split(" ")[1] || null

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err) return res.status(401).send({ msg: "Session invalid or expired, try signing in again" });
        
            const { community_admin, community_name, community_topic, community_description, community_icon, community_banner, community_access, community_maturity } = req.body;

            const bufferIcon = community_icon ? Buffer.from(community_icon.split(",")[1], "base64") : ""
            const bufferBanner = community_banner ? Buffer.from(community_banner.split(",")[1], "base64") : ""

            const bufferIconName = community_icon ? `_icon_${community_name.replace(/\s/g, "_")}_${Date.now()}.jpg` : ""
            const bufferBannerName = community_banner ? `_banner_${community_name.replace(/\s/g, "_")}_${Date.now()}.jpg` : ""

            if (community_icon) {
                 (async () => {
                    try {
                        await sharp(bufferIcon)
                        .jpeg({ quality: 80 })
                        .resize(400).toFile(`assets/community_images/${bufferIconName}`)
    
                    } catch (err) {
                        res.status(500).json({ acknowledged: false, message: "Failed to upload image" })
                    }
                })()
            }

            if (community_banner) {
                 (async () => {
                    try {
                        await sharp(bufferBanner)
                        .jpeg({ quality: 100 })
                        .resize(1280, 768).toFile(`assets/community_images/${bufferBannerName}`)

                    } catch (err) {
                        res.status(500).json({ acknowledged: false, message: "Failed to upload banner image" })
                    }
                })()
            }


            CommunityModel.create({
                community_admin, 
                community_name, 
                community_topic, 
                community_description, 
                community_icon: `assets/community_images/${bufferIconName}`, 
                community_banner: `assets/community_images/${bufferBannerName}`, 
                community_access, 
                community_maturity,
                community_members: [community_admin]
            }).then((response) => {
                return res.send({ accepted: true, msg: "Community created successfully" })
            }).catch((err) => {
                const err_pattern = Object.keys(err.keyPattern)[0]

                if (err_pattern == "community_name") 
                    return res.status(409).send({ msg: "Community name already taken" })

            })

        })
    } else {
        return res.status(401).send({ msg: "Session invalid or expired, try signing in again" })        
    }

})


communityRouter.get("/api/community/fetch", (req, res) => {

    CommunityModel.find().then((response) => {
        res.send(response)
    }).catch((error) => {
        return res.status(500).send({ msg: "Failed to fetch communities, something went wrong" })
    })

})

communityRouter.get("/api/community/fetch/:id", (req, res) => {

    // const tmp = req.originalUrl.split("/")
    // const community_id = tmp[tmp.length - 1]
    const community_id = req.params.id;

    CommunityModel.findOne({ _id: community_id }).then((response) => {        
        res.send(response)
    }).catch((error) => {
        return res.status(500).send({ msg: "Failed to fetch communities, something went wrong" })
    })

})

communityRouter.post("/api/community/join", (req, res) => {
    const { community_id, user_id } = req.body;
    
    CommunityModel.updateOne({ _id: community_id }, { $push: { community_members: user_id } }).then((response) => {
        if (response.acknowledged)
            res.send({ accepted: true, msg: "Community joined successfully" })
    }).catch((error) => {
        console.log(error)
    })

})

module.exports = communityRouter;