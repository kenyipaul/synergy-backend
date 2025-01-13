const fs = require("fs")
const bcrypt = require("bcrypt")
const multer = require("multer")
const SignupRouter = require('express').Router();
const User = require("../models/user.model")
const UserInfo = require("../models/user.info.model")

const upload = multer({ dest: "assets/profile_pictures/" })

SignupRouter.post("/api/signup", upload.single("image"), (req, res) => {
    const { username, firstName, lastName, email, password, image, dob } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10);
    const imageName = image ? `assets/profile_pictures/${username}_${new Date().getTime()}.jpg` : ""

    User.create({
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword
    }).then((response) => {
        const userId = response._id.toString();

        if (image) {
            const imageBuffer = Buffer.from(image.split(",")[1], "base64")
    
            fs.writeFile(imageName, imageBuffer, "base64", (err, data) => {
                console.log(err, data)
            });
        }

        UserInfo.create({ 
            user_id: userId, 
            dob: dob,
            image: imageName
        })

        return res.send({ acknowledged: true, msg: "Signup Successful" })

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