const fs = require("fs")
const bcrypt = require("bcrypt")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user.model")
const SignupRouter = require('express').Router();

const upload = multer({ dest: "assets/profile_pictures/" })

SignupRouter.post("/api/signup", upload.single("image"), (req, res) => {
    const { username, firstName, lastName, email, password, image, dob } = req.body
    const imageName = image ? `assets/profile_pictures/${username}_${new Date().getTime()}.jpg` : "assets/profile_pictures/default.jpg"
    const hashedPassword = bcrypt.hashSync(password, 10);


    if (image) {
        const imageBuffer = Buffer.from(image.split(",")[1], "base64")

        sharp(imageBuffer).resize(500, 500).toFile(imageName, (err, info) => {
            if (err) {
                imageName = ""
                res.status(500).send({ msg: "Something went wrong when uploading image" })
            }
        })
    }

    User.create({
        username, firstName, lastName, email, dob: dob, password: hashedPassword, image: imageName
    }).then(() => {
        return res.send({ accepted: true, msg: "Signup Successful" })
    }).catch((error) => {
        if (error.code == 11000) {
            let keyPattern = Object.keys(error.keyPattern)[0]

            if (keyPattern == "username")
                return res.status(409).send({ acknowledged: false, msg: "Username is already in use" })
            else if (keyPattern == "email")
                return res.status(409).send({ acknowledged: false, msg: "Email address has already been used" })
        }

        console.log(error)
    })

})

module.exports = {
    SignupRouter
}