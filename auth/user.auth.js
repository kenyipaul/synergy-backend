const jwt = require("jsonwebtoken")
const UserModel = require("../models/user.model")
const userInfo = require("../models/user.info.model")
const authRouter = require("express").Router();

authRouter.post("/api/auth", (req, res) => {
    const token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
            return res.status(401).send({ acknowledged: false, msg: "Session invalid or expired" })
        }

        UserModel.findOne({_id: data.id}).then((response) => {
            userInfo.findOne({ user_id: data.id }).then((info) => {
    
                const User = {
                    id: data.id,
                    username: response.username,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    image: info.image,
                    bio: info.bio
                }
    
                return res.send(User);
    
            })
        })

    })
})

module.exports = authRouter