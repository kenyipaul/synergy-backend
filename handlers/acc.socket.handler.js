const sharp = require("sharp")
const bcrypt = require("bcrypt")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken")

module.exports = (socket) => {


    // CREATE AN ACCOUNT 

    socket.on("user/create/account", data => {
        let imageName = data.image ? `assets/profile_pictures/${data.username}_${new Date().getTime()}.jpg` : "assets/profile_pictures/default.jpg"
        const hashedPassword = bcrypt.hashSync(data.password, 10);

        if (data.image) {
            const imageBuffer = Buffer.from(data.image.split(",")[1], "base64")

            sharp(imageBuffer).resize(500, 500).toFile(imageName, (err, info) => {
                if (err) {
                    imageName = ""
                    socket.emit("user/create/account/response", { error: true, msg: "Something went wrong when uploading image" })
                }
            })

        }

        User.create({ username: data.username, firstName: data.firstName, lastName: data.lastName, email: data.email, dob: data.dob, password: hashedPassword, image: imageName }).then((response) => {
            return socket.emit("user/create/account/response", { error: false, accepted: true, msg: "Signup Successful" });
        }).catch((error) => {
            if (error.code == 11000) {
                let keyPattern = Object.keys(error.keyPattern)[0]
                
                if (keyPattern == "username") {
                    return socket.emit("user/create/account/response", { error: true, msg: "Username is already taken" });
                }
                else if (keyPattern == "email") {
                    return socket.emit("user/create/account/response", { error: true, msg: "Email address already in use" });
                }
            }
        })

    })


    // LOG INTO ACCOUNT 

    socket.on("user/login", loginData => {
        User.findOne({ email: loginData.email }).then((response) => {
            
            if (response) {
                bcrypt.compare(loginData.password, response.password, (err, data) => {
                    if (err) return socket.emit("user/login/response", { error: true, msg: "Internal Server Error, Please try again later"})
    
                    if (data) {
                        const User = {
                            id: response._id,
                            username: response.username,
                            firstName: response.firstName,
                            lastName: response.lastName,
                            email: response.email,
                            image: response.image,
                            bio: response.bio
                        }
    
                        const token = jwt.sign(User, process.env.SECRET_KEY, { expiresIn: "1d" });
                        return socket.emit("user/login/response", { accepted: true, user: User, token: token });
    
                    }
    
                })
            } else {
                return socket.emit("user/login/response", { error: true, msg: "Incorrect email or password"})
            }
        })
    })

}