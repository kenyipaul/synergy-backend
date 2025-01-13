const userRouter = require('express').Router();
const UserModel = require("../models/user.model");
const userInfo = require("../models/user.info.model")

userRouter.post("/api/user/update/profile", (req, res) => {

    const { id, username, firstName, lastName, email } = req.body;

    UserModel.findOneAndUpdate({_id: id}, { $set: { username, firstName, lastName, email  } }).then((response) => {
        
        const user = {
            id: response._id,
            username: response.username,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
        }

        userInfo.findOne({ user_id: id }).then((info) => {
            user.bio = info.bio;
            user.image = info.image
        }).finally(() => {
            res.send(user)
        })

    })

})

module.exports = userRouter